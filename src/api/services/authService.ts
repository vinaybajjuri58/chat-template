import { createClient } from "@/utils/supabase/server"
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
} from "../utils/types"

export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<AuthResponse>> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      return {
        error: error.message,
        status: 401,
      }
    }

    // Get user data from users table
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user?.id)
      .single()

    return {
      data: {
        user: userData as User,
        token: data.session?.access_token,
      },
      status: 200,
    }
  } catch (error) {
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
    // Register the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    })

    if (authError) {
      return {
        error: authError.message,
        status: 400,
      }
    }

    if (!authData.user) {
      return {
        error: "Failed to create user",
        status: 500,
      }
    }

    // Create user profile in users table
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          createdAt: new Date(),
        },
      ])
      .select()
      .single()

    if (profileError) {
      return {
        error: profileError.message,
        status: 500,
      }
    }

    return {
      data: {
        user: profileData as User,
        token: authData.session?.access_token,
      },
      status: 201,
    }
  } catch (error) {
    return {
      error: "Registration failed",
      status: 500,
    }
  }
}
