import { createClient } from "@/utils/supabase/server"
import { User, ApiResponse } from "../utils/types"

export async function getUsers(): Promise<ApiResponse<User[]>> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.from("users").select("*")
    if (error) {
      return {
        error: error.message,
        status: 500,
      }
    }
    return {
      data,
      status: 200,
    }
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return {
      error: "Failed to fetch users",
      status: 500,
    }
  }
}

export async function getUserById(
  id: string
): Promise<ApiResponse<User | null>> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
    if (error) {
      return {
        error: error.message,
        status: 500,
      }
    }
    if (!data) {
      return {
        error: "User not found",
        status: 404,
      }
    }

    return {
      data: data[0],
      status: 200,
    }
  } catch (error) {
    console.error(`Failed to fetch user with ID ${id}:`, error)
    return {
      error: "Failed to fetch user",
      status: 500,
    }
  }
}
