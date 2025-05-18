"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"

import { ChatSidebar as ChatSidebarComponent } from "@/components/ChatSidebar"
import { TChatListItem } from "@/types/chat"
import { fetchFromApi, postToApi } from "@/utils/api"
import { Button } from "@/components/ui/button"

export function ChatSidebar() {
  const params = useParams()
  const router = useRouter()
  const [chats, setChats] = useState<TChatListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchChats() {
      try {
        setLoading(true)
        const data = await fetchFromApi<{ data: TChatListItem[] }>("/chats")
        setChats(data.data || [])
      } catch (err) {
        console.error("Error fetching chats:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load chats. Please try again."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [])

  async function handleCreateNewChat() {
    try {
      // Generate a sequential title based on the number of existing chats
      const chatNumber = chats.length + 1
      const chatTitle = `Chat ${chatNumber}`

      const data = await postToApi<{ data: { id: string } }, { title: string }>(
        "/chats",
        {
          title: chatTitle,
        }
      )

      // Navigate to the new chat
      router.push(`/chat/${data.data.id}`)

      // Update the local chats list
      setChats((prevChats) => [
        {
          id: data.data.id,
          title: chatTitle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prevChats,
      ])
    } catch (err) {
      console.error("Error creating new chat:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create a new chat. Please try again."
      )
    }
  }

  return (
    <div className="px-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCreateNewChat}
        className="flex w-full justify-start items-center text-muted-foreground mb-2"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        <span>New Chat</span>
      </Button>

      <ChatSidebarComponent
        chats={chats}
        loading={loading}
        error={error}
        activeChatId={params?.chatId as string}
        onCreateChat={handleCreateNewChat}
        compact={true}
      />
    </div>
  )
}
