import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { useState } from "react"
import { postToApi } from "@/utils/api"

// Create a type that can handle either the standard User or our modified version
type UserWithPossiblyNullEmail =
  | User
  | {
      id: string
      email?: string | null
      email_confirmed_at: string | null
      [key: string]: unknown
    }

type TEmailVerificationStatusProps = {
  user: UserWithPossiblyNullEmail | null
}

export function EmailVerificationStatus({
  user,
}: TEmailVerificationStatusProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<{
    success?: string
    error?: string
  }>({})

  const isVerified = user?.email_confirmed_at !== null

  const handleResendVerification = async () => {
    if (!user?.email) return

    setIsResending(true)
    setResendStatus({})

    try {
      await postToApi("auth/resend-verification", {})

      setResendStatus({
        success: "Verification email sent! Please check your inbox.",
      })
    } catch (error) {
      setResendStatus({
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      })
    } finally {
      setIsResending(false)
    }
  }

  if (isVerified) {
    return (
      <Alert className="border-primary/20 bg-primary/5">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertTitle className="font-semibold">Email Verified</AlertTitle>
        <AlertDescription>
          Your email address has been verified.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      <Alert className="border-accent bg-accent/10">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="font-semibold">
          Your Email Is Not Verified
        </AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Please check your inbox and click the verification link to verify
            your email address. While you can use some features without
            verification, a verified email ensures you have full access to all
            platform features.
          </p>
          <p className="text-sm text-muted-foreground">
            If you don&apos;t see the email, check your spam folder or use the
            resend button below.
          </p>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendVerification}
          disabled={isResending}
          className="self-start"
        >
          {isResending ? "Sending..." : "Resend Verification Email"}
        </Button>

        {resendStatus.success && (
          <p className="mt-2 text-sm text-primary">{resendStatus.success}</p>
        )}

        {resendStatus.error && (
          <p className="mt-2 text-sm text-destructive">{resendStatus.error}</p>
        )}
      </div>
    </div>
  )
}
