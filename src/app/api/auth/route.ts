import { login, signup, signout } from "@/api/services/authService"
import { LoginRequest, SignupRequest } from "@/api/utils/types"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    return NextResponse.json(result.data, { status: result.status })
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

    return NextResponse.json(result.data, { status: result.status })
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
}
