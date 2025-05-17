import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // First try to get email from request body
    let email: string | null = null

    try {
      const body = await req.json()
      email = body.email || null
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
    }

    // If no email provided, try to get the current user session
    if (!email) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return NextResponse.json(
          { error: "No email provided and not authenticated" },
          { status: 400 }
        )
      }

      email = session.user.email || null
    }

    // Ensure we have an email to send verification to
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Resending verification email to:", email)

    // Resend the verification email to the user's email
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
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
