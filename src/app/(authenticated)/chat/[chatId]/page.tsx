"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TChat } from "@/types/chat"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchFromApi } from "@/utils/api"

export default function ChatDetailPage() {
  const params = useParams()
  const chatId = params?.chatId as string

  const [chat, setChat] = useState<TChat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchChat() {
      if (!chatId) return

      try {
        setLoading(true)
        setError(null)

        const data = await fetchFromApi<{ data: TChat }>(`/chats/${chatId}`)
        setChat(data.data)
      } catch (err) {
        console.error("Error fetching chat:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load chat. Please try again."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchChat()
  }, [chatId])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="p-6">
        <div className="bg-muted p-4 rounded-md">Chat not found</div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{chat.title}</h1>
        <p className="text-sm text-muted-foreground">
          Created {new Date(chat.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {chat.messages && chat.messages.length > 0 ? (
          chat.messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-12"
                  : "bg-muted mr-12"
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.role === "user" ? "You" : "Assistant"}
              </div>
              <div>{message.content}</div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start your conversation.
          </div>
        )}
      </div>

      {/* Chat input would go here */}
    </div>
  )
}
