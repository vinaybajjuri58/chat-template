"use client"

import { Button } from "@/components/ui/button"
import { postToApi } from "@/utils/api"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut } from "lucide-react"

export function SignOutButton({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await postToApi("auth", { action: "signout" })
      router.push("/login")
      router.refresh() // Force refresh to update auth state
    } catch (error) {
      console.error("Failed to sign out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        "Signing out..."
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </>
      )}
    </Button>
  )
}
