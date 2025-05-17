import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
} from "../utils/types"

// Helper function to wait for a specified time
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<AuthResponse>> {
  const supabase = await createClient()
  try {
    console.log("Login attempt for email:", credentials.email)

    // Check if the email exists in the profiles table
    const { data: profileCheck, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", credentials.email)
      .maybeSingle()

    // If no profile found with this email, suggest signing up
    if (!profileCheckError && !profileCheck) {
      console.log("Email not found in the system:", credentials.email)
      return {
        error: "This email is not registered. Please sign up first.",
        status: 404, // Not Found status code
      }
    }

    // Authenticate the user - will work even if email is not verified
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      console.error("Login error from Supabase auth:", error)

      // Check if the error is related to email verification
      if (
        error.message?.includes("Email not confirmed") ||
        error.message?.includes("Email verification required")
      ) {
        console.log(
          "User's email is not verified, using admin API to confirm email"
        )

        try {
          // Create admin client to access admin API
          const adminClient = createAdminClient()

          // First, get the user by email to find their ID
          const { data: userData } = await adminClient
            .from("auth.users")
            .select("id, email")
            .eq("email", credentials.email)
            .single()

          if (!userData) {
            console.error("Could not find user with email:", credentials.email)
            return {
              error: "Could not find your account. Please try again.",
              status: 404,
            }
          }

          // Now use the admin client to directly update the user's confirmation status
          const { error: updateError } =
            await adminClient.auth.admin.updateUserById(userData.id, {
              email_confirm: true,
            })

          if (updateError) {
            console.error("Failed to confirm email:", updateError)
            return {
              error:
                "Failed to verify your email. Please try again or contact support.",
              status: 500,
            }
          }

          // Now try to sign in the user again - this should work since the email is now verified
          console.log("Email confirmed, attempting login again")
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })

          if (signInError) {
            console.error(
              "Still failed to login after email confirmation:",
              signInError
            )
            return {
              error: "Email verified but login still failed. Please try again.",
              status: 401,
            }
          }

          // Successfully signed in with now-verified email
          return {
            data: {
              user: {
                id: signInData.user.id,
                name: signInData.user.user_metadata?.name || "",
                email: signInData.user.email || "",
                createdAt:
                  signInData.user.created_at || new Date().toISOString(),
              },
              token: signInData.session?.access_token,
            },
            status: 200,
          }
        } catch (adminError) {
          console.error("Admin API error:", adminError)
          return {
            error:
              "Could not verify your email automatically. Please check your inbox for verification link.",
            status: 500,
          }
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
      console.error("No user data available after auth attempt")
      return {
        error: "Authentication failed. Please check your credentials.",
        status: 401,
      }
    }

    console.log("Supabase auth successful, user ID:", data.user.id)

    // Get user data from profiles table
    console.log("Fetching profile data for user ID:", data.user.id)
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    // If profile not found, create one
    if (userError) {
      console.error("User data fetch error:", userError)

      if (userError.code === "PGRST116") {
        console.log("Profile not found, creating one")

        // Create a basic profile for the user
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || "",
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Failed to create profile during login:", insertError)
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
      },
      status: 200,
    }
  } catch (error) {
    console.error("Login exception:", error)
    return {
      error: "Authentication failed",
      status: 500,
    }
  }
}

export async function signup(
  userData: SignupRequest
): Promise<ApiResponse<AuthResponse>> {
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
        email_confirm: true, // Skip email verification
        user_metadata: {
          name: userData.name, // Store name in user metadata
        },
      })

    if (authError) {
      console.error("Auth signup error:", authError)
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
      console.error("Auth data missing user:", authData)
      return {
        error: "Failed to create user",
        status: 500,
      }
    }

    // Always sign in the user immediately after signup
    // This makes sure they're logged in regardless of email verification status
    console.log("Signing in user immediately after signup")
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      })

    if (signInError) {
      console.error("Auto sign-in after signup failed:", signInError)
      // If auto sign-in fails, log the error but continue with the signup flow
      // The account was still created successfully
    } else {
      console.log("Auto sign-in successful, session established")
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
      console.error("Profile update error:", updateError)
      // Non-critical error, we can still proceed
    }

    // Fetch the profile to return
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      // Create a simplified user object if we can't fetch the profile
      const simpleUser: User = {
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        createdAt: new Date().toISOString(),
      }

      return {
        data: {
          user: simpleUser,
          // Standardize to use the session from signin
          token: signInData?.session?.access_token || undefined,
        },
        status: 201,
      }
    }

    // Return the profile data
    return {
      data: {
        user: {
          id: profileData.id,
          name: profileData.name || userData.name,
          email: profileData.email,
          createdAt: profileData.created_at,
        },
        // Standardize to use the session from signin
        token: signInData?.session?.access_token || undefined,
      },
      status: 201,
    }
  } catch (error) {
    console.error("Signup exception:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Registration failed"

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

export async function signout(): Promise<ApiResponse<null>> {
  const supabase = await createClient()
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Signout error:", error)
      return {
        error: error.message,
        status: 500,
      }
    }

    return {
      data: null,
      status: 200,
    }
  } catch (error) {
    console.error("Signout exception:", error)
    return {
      error: "Failed to sign out",
      status: 500,
    }
  }
}
