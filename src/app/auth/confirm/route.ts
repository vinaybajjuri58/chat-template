import { type EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") || "/dashboard"
  const returnJson = searchParams.get("json") === "true"

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete("token_hash")
  redirectTo.searchParams.delete("type")
  redirectTo.searchParams.delete("json")

  if (token_hash && type) {
    const supabase = await createClient()

    const { error, data } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // If JSON response is requested, return verification status
      if (returnJson) {
        return NextResponse.json({
          success: true,
          message: "Email successfully verified",
          user: data.user,
        })
      }

      // Otherwise redirect to the next URL
      redirectTo.searchParams.delete("next")
      return NextResponse.redirect(redirectTo)
    } else {
      // If JSON response is requested, return error
      if (returnJson) {
        return NextResponse.json(
          {
            success: false,
            message: error.message || "Verification failed",
          },
          { status: 400 }
        )
      }
    }
  }

  // If JSON response is requested but verification failed, return error
  if (returnJson) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid verification link",
      },
      { status: 400 }
    )
  }

  // Redirect to error page for regular requests
  redirectTo.pathname = "/verify-email/error"
  return NextResponse.redirect(redirectTo)
}
