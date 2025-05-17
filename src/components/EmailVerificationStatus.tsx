import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { useState } from "react"

interface EmailVerificationStatusProps {
  user: User | null
}

export function EmailVerificationStatus({
  user,
}: EmailVerificationStatusProps) {
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
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email")
      }

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
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Email Verified</AlertTitle>
        <AlertDescription className="text-green-700">
          Your email address has been verified.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Email Not Verified</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p>
            Please check your inbox and click the verification link to verify
            your email.
          </p>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendVerification}
          disabled={isResending}
          className="self-start border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 max-w-xs"
        >
          {isResending ? "Sending..." : "Resend Verification Email"}
        </Button>

        {resendStatus.success && (
          <p className="mt-2 text-sm text-green-600">{resendStatus.success}</p>
        )}

        {resendStatus.error && (
          <p className="mt-2 text-sm text-red-600">{resendStatus.error}</p>
        )}
      </div>
    </div>
  )
}
