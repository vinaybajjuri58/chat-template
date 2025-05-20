"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { postToApi } from "@/utils/api"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationRequired, setVerificationRequired] =
    useState<boolean>(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/dashboard"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResendStatus(null)
    setVerificationRequired(false)

    try {
      // Call our auth API endpoint
      await postToApi("auth", {
        action: "login",
        email,
        password,
      })

      // If we got here, login was successful
      router.push(redirectPath)
    } catch (err) {
      // Check if this is a verification required error
      if (
        err instanceof Error &&
        (err.message.includes("verify your email") ||
          err.message.includes("verification") ||
          err.message.includes("not confirmed"))
      ) {
        setVerificationRequired(true)
      } else {
        // Show other error messages
        setError(
          err instanceof Error ? err.message : "Login failed. Please try again."
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Function to resend verification email
  const handleResendVerification = async () => {
    setIsLoading(true)
    setResendStatus(null)

    try {
      await postToApi("auth/resend-verification", { email })
      setResendStatus("Verification email sent! Please check your inbox.")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationRequired ? (
            <div className="space-y-4">
              <Alert className="border-accent bg-accent/10">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold">
                  Email Verification Required
                </AlertTitle>
                <AlertDescription>
                  <p>
                    You need to verify your email before logging in. Please
                    check your inbox for a verification link.
                  </p>
                  <p className="text-sm mt-1 text-muted-foreground">
                    If you don&apos;t see the email, check your spam folder or
                    request a new verification email.
                  </p>
                </AlertDescription>
              </Alert>

              {resendStatus && (
                <div className="p-3 text-sm bg-primary/10 text-primary rounded-md">
                  {resendStatus}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={handleResendVerification}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Resend Verification Email"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/login"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
