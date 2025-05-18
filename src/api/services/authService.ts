import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import {
  TApiResponse,
  TAuthResponse,
  TLoginRequest,
  TSignupRequest,
} from "@/types"

// Helper function to wait for a specified time
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function login(
  credentials: TLoginRequest
): Promise<TApiResponse<TAuthResponse>> {
  const supabase = await createClient()
  try {
    // Check if the email exists in the profiles table
    const { data: profileCheck, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", credentials.email)
      .maybeSingle()

    // If no profile found with this email, suggest signing up
    if (!profileCheckError && !profileCheck) {
      return {
        error: "This email is not registered. Please sign up first.",
        status: 404, // Not Found status code
      }
    }

    // Authenticate the user - Supabase allows login even with unverified emails by default
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      // Check if the error is related to email verification
      if (
        error.message?.includes("Email not confirmed") ||
        error.message?.includes("Email verification required") ||
        error.code === "email_not_confirmed"
      ) {
        return {
          error:
            "Please verify your email before logging in. Check your inbox for a verification link or request a new one.",
          status: 403,
          emailVerificationRequired: true,
        }
      } else {
        // For any other errors, return the error
        return {
          error: error.message,
          status: 401,
        }
      }
    }

    // If no error and we have data, proceed normally
    if (!data || !data.user) {
      return {
        error: "Authentication failed. Please check your credentials.",
        status: 401,
      }
    }

    // Get user data from profiles table
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    // If profile not found, create one
    if (userError) {
      if (userError.code === "PGRST116") {
        // Create a basic profile for the user
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || "",
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          return {
            error: "Failed to setup user profile",
            status: 500,
          }
        }

        // Return basic user data from auth
        return {
          data: {
            user: {
              id: data.user.id,
              name: data.user.user_metadata?.name || "",
              email: data.user.email || "",
              createdAt: new Date().toISOString(),
            },
            token: data.session?.access_token,
            emailVerified: false,
          },
          status: 200,
        }
      }

      return {
        error: "Failed to retrieve user information",
        status: 500,
      }
    }

    // Return user data from profile
    return {
      data: {
        user: {
          id: userData.id,
          name: userData.name || "",
          email: userData.email,
          createdAt: userData.created_at,
        },
        token: data.session?.access_token,
        emailVerified: true,
      },
      status: 200,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      error: "Authentication failed",
      status: 500,
    }
  }
}

export async function signup(
  userData: TSignupRequest
): Promise<TApiResponse<TAuthResponse>> {
  const supabase = await createClient()

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userData.email)
      .maybeSingle()

    if (checkError) {
      console.error("User existence check error:", checkError)
    }

    if (existingUser && existingUser.id) {
      return {
        error:
          "This email is already registered. Please log in or use a different email.",
        status: 409, // Conflict status code
      }
    }

    // Register the user with Supabase Auth
    const adminClient = createAdminClient()
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: false, // Email verification required
        user_metadata: {
          name: userData.name, // Store name in user metadata
        },
      })

    if (authError) {
      // Handle specific error cases
      if (authError.message.includes("already been registered")) {
        return {
          error:
            "This email is already registered. Please log in or use a different email.",
          status: 409, // Conflict status code
        }
      }

      if (authError.message.includes("password")) {
        return {
          error: "Password must be at least 6 characters long.",
          status: 400,
        }
      }

      return {
        error: authError.message || "Failed to create account",
        status: 400,
      }
    }

    if (!authData?.user) {
      return {
        error: "Failed to create user",
        status: 500,
      }
    }

    // Manually trigger the verification email since we're using the admin API
    try {
      const userEmail = authData.user.email
      if (!userEmail) {
        throw new Error("User email is missing")
      }

      // Use localhost for development if NEXT_PUBLIC_SITE_URL is not set
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://chat-template-ten.vercel.app/"

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
        options: {
          emailRedirectTo: `${siteUrl}/auth/confirm`,
        },
      })

      if (error) {
        // Non-critical error, we still proceed with signup
      }
    } catch {
      // Non-critical error, we still proceed with signup
    }

    // Use Supabase's built-in trigger to create the profile
    // The trigger we created will automatically create a profile record
    // Just wait a moment to make sure it's created
    await sleep(1000)

    // Try to update the name in the profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: userData.name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id)

    if (updateError) {
      // Non-critical error, we can still proceed
    }

    // Return success but without a token - they need to verify email first
    return {
      data: {
        user: {
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          createdAt: new Date().toISOString(),
        },
        // No token - must verify email first
        emailVerified: false,
      },
      status: 201,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Registration failed"
    console.error("Signup error:", errorMessage)

    // Check for common error patterns
    if (
      errorMessage.includes("already") &&
      errorMessage.includes("registered")
    ) {
      return {
        error:
          "This email is already registered. Please log in or use a different email.",
        status: 409,
      }
    }

    return {
      error: errorMessage,
      status: 500,
    }
  }
}

export async function signout(): Promise<TApiResponse<null>> {
  const supabase = await createClient()
  try {
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      return {
        error: signOutError.message,
        status: 500,
      }
    }

    return {
      data: null,
      status: 200,
    }
  } catch (error) {
    console.error("Sign out error:", error)
    return {
      error: "Failed to sign out",
      status: 500,
    }
  }
}
