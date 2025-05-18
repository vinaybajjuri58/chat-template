"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { postToApi } from "@/utils/api"
import Link from "next/link"
import apiClient from "@/utils/apiClient"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [message, setMessage] = useState("Verifying your email...")
  const [email, setEmail] = useState("")

  const verifyEmail = useCallback(async () => {
    try {
      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type")

      if (!token_hash || !type) {
        setStatus("error")
        setMessage(
          "Invalid verification link. Please check your email for the correct link."
        )
        return
      }

      // Use axios to call the auth confirmation endpoint
      const response = await apiClient.get(`/auth/confirm`, {
        params: {
          token_hash: token_hash,
          type: type,
          json: true,
        },
      })

      const data = response.data

      if (data.success) {
        setStatus("success")
        setMessage(data.message || "Your email has been successfully verified!")
        if (data.user?.email) {
          setEmail(data.user.email)
        }
      } else {
        setStatus("error")
        setMessage(
          data.message ||
            "Failed to verify your email. Please try again or request a new verification link."
        )
      }
    } catch (error) {
      console.error("Verification error:", error)
      setStatus("error")
      setMessage(
        "An error occurred during verification. Please try again later."
      )
    }
  }, [searchParams])

  useEffect(() => {
    verifyEmail()
  }, [verifyEmail])

  const handleResendVerification = async () => {
    try {
      setStatus("loading")
      setMessage("Sending verification email...")

      await postToApi("auth/resend-verification", { email })

      setStatus("loading")
      setMessage("Verification email sent! Please check your inbox.")
    } catch (error) {
      console.error("Error resending verification:", error)
      setStatus("error")
      setMessage("Failed to send verification email. Please try again later.")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Email Verification</CardTitle>
          <CardDescription>
            {status === "loading"
              ? "Verifying your email address..."
              : status === "success"
                ? "Your email has been verified"
                : "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-center">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-primary mb-4" />
              <p className="text-center mb-4">{message}</p>
              <p className="text-sm text-muted-foreground">
                You can now use all the features of our application.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-center mb-4">{message}</p>
              {email && (
                <Button
                  variant="outline"
                  onClick={handleResendVerification}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Resend verification email
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status !== "loading" && (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
