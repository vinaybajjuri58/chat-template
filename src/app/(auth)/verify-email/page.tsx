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

      // Redirect to the API endpoint with the parameters
      const response = await fetch(
        `/auth/confirm?token_hash=${encodeURIComponent(
          token_hash
        )}&type=${encodeURIComponent(type)}&json=true`
      )

      const data = await response.json()

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
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
              <p className="text-center">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-green-700 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                You can now use all the features of our application.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-center text-red-700 mb-4">{message}</p>
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
