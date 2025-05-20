"use client"

import { LucideMessageSquarePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchFromApi, postToApi } from "@/utils/api"
import { TChatListItem } from "@/types/chat"

export default function ChatPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatsCount, setChatsCount] = useState(0)

  // Fetch the current chats count to generate the next chat number
  useEffect(() => {
    async function fetchChatsCount() {
      try {
        const data = await fetchFromApi<{ data: TChatListItem[] }>("/chats")
        setChatsCount(data.data?.length || 0)
      } catch {
        // No need to set error here, just for counting
      }
    }

    fetchChatsCount()
  }, [])

  async function handleCreateChat() {
    try {
      setIsCreating(true)
      setError(null)

      // Generate a sequential title based on the number of existing chats
      const chatNumber = chatsCount + 1
      const chatTitle = `Chat ${chatNumber}`

      const data = await postToApi<{ data: { id: string } }, { title: string }>(
        "/chats",
        {
          title: chatTitle,
        }
      )

      router.push(`/chat/${data.data.id}`)
    } catch (err) {
      console.error("Error creating chat:", err)
      setError(err instanceof Error ? err.message : "Failed to create chat")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
        <div className="p-6 bg-primary/5 rounded-full">
          <LucideMessageSquarePlus className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Start a New Chat</h1>
        <p className="text-muted-foreground">
          Create a new chat to start a conversation with an AI assistant.
        </p>
        {error && (
          <div className="text-destructive text-sm bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
        <Button size="lg" onClick={handleCreateChat} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create New Chat"}
        </Button>
      </div>
    </div>
  )
}
