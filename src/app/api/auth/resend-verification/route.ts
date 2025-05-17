import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Resend the verification email to the user's email
    if (!session.user.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      )
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: session.user.email,
    })

    if (error) {
      console.error("Error resending verification email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: "Verification email sent successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in resend verification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
