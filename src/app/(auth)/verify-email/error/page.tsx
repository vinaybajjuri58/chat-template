"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { postToApi } from "@/utils/api"
import Link from "next/link"

export default function VerificationErrorPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "error">("error")

  const handleResendVerification = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address")
      setMessageType("error")
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      await postToApi("auth/resend-verification", { email })

      setMessageType("success")
      setMessage("Verification email sent! Please check your inbox.")
    } catch (error) {
      console.error("Error resending verification:", error)
      setMessageType("error")
      setMessage("Failed to send verification email. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Email Verification Failed</CardTitle>
          <CardDescription>
            We couldn&apos;t verify your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="flex flex-col items-center mb-6">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-center mb-4">
              The verification link may have expired or is invalid. Please
              request a new verification email.
            </p>
          </div>

          <form
            onSubmit={handleResendVerification}
            className="w-full space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Your email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {message && (
              <div
                className={`p-3 text-sm rounded-md ${
                  messageType === "success"
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Back to Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
