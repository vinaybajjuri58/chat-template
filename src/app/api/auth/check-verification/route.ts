import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Simply return verification status from the current session
    return NextResponse.json({
      isVerified: user.email_confirmed_at !== null,
      email: user.email,
    })
  } catch (error) {
    console.error("Error checking email verification:", error)
    return NextResponse.json(
      { error: "Failed to check email verification status" },
      { status: 500 }
    )
  }
}
