import { login, signup, signout } from "@/api/services/authService"
import { LoginRequest, SignupRequest } from "@/api/utils/types"
import { NextRequest, NextResponse } from "next/server"

// Helper function to ensure values are JSON serializable
function sanitizeForJson(data: any): any {
  if (data === null || data === undefined) {
    return null
  }

  if (typeof data !== "object") {
    return data
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString()
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForJson(item))
  }

  // Handle plain objects
  const result: Record<string, any> = {}
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      result[key] = sanitizeForJson(data[key])
    }
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    // Determine if it's a login or signup request by checking the action field
    const body = await request.json()
    const { action, ...data } = body

    if (!action) {
      return NextResponse.json(
        { error: "Action field is required" },
        { status: 400 }
      )
    }

    // Handle login request
    if (action === "login") {
      const credentials = data as LoginRequest

      // Validate request
      if (!credentials.email || !credentials.password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        )
      }

      const result = await login(credentials)

      if (result.error) {
        console.log("Login failed with error:", result.error)
        return NextResponse.json(
          { error: result.error },
          { status: result.status }
        )
      }

      // Sanitize data to ensure it's JSON serializable
      const sanitizedData = sanitizeForJson(result.data)
      console.log("Login success, returning data:", sanitizedData)
      return NextResponse.json(sanitizedData, { status: result.status })
    }

    // Handle signup request
    if (action === "signup") {
      const userData = data as SignupRequest

      // Validate request
      if (!userData.name || !userData.email || !userData.password) {
        return NextResponse.json(
          { error: "Name, email, and password are required" },
          { status: 400 }
        )
      }

      const result = await signup(userData)

      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: result.status }
        )
      }

      // Sanitize data to ensure it's JSON serializable
      const sanitizedData = sanitizeForJson(result.data)
      console.log("Sanitized signup response:", JSON.stringify(sanitizedData))
      return NextResponse.json(sanitizedData, { status: result.status })
    }

    // Handle signout request
    if (action === "signout") {
      const result = await signout()

      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: result.status }
        )
      }

      return NextResponse.json(
        { message: "Successfully signed out" },
        { status: 200 }
      )
    }

    // If action is neither login nor signup nor signout
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Auth API error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
