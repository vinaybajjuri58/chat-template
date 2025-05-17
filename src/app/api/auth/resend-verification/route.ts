import { createClient } from "@/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Send a new verification email
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`,
      },
    })

    if (error) {
      console.error("Error resending verification email:", error)
      return NextResponse.json(
        { error: error.message || "Failed to send verification email" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Verification email sent successfully",
        data: data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
