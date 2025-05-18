"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MessageSquare, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your AI Chat Dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push("/chat")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              New Chat
            </CardTitle>
            <CardDescription>
              Start a new conversation with the AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Ask questions, get summaries, brainstorm ideas, and more.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Manage your profile settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Update your account information and preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
