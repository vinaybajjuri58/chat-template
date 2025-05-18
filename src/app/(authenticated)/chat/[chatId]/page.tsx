"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TChat, TMessage, TMessageRole } from "@/types/chat"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchFromApi, postToApi } from "@/utils/api"
import { Message } from "@/components/Message"
import { MessageInput } from "@/components/MessageInput"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function ChatDetailPage() {
  const params = useParams()
  const chatId = params?.chatId as string

  const [chat, setChat] = useState<TChat | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Local messages to use as fallback if API fails
  const [localMessages, setLocalMessages] = useState<TMessage[]>([])
  const [useLocalMessages, setUseLocalMessages] = useState(false)

  const fetchChat = async () => {
    if (!chatId) return

    try {
      setLoading(true)
      setError(null)

      const data = await fetchFromApi<{ data: TChat }>(`/chats/${chatId}`)
      setChat(data.data)

      // If we got real messages from the API, update local messages too
      if (data.data.messages && data.data.messages.length > 0) {
        setLocalMessages(data.data.messages)
        setUseLocalMessages(false)
      }
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

  useEffect(() => {
    fetchChat()
  }, [chatId])

  const handleSendMessage = async (message: string) => {
    if (!chatId || !message.trim()) return

    try {
      await postToApi<{ data: TMessage }, { message: string }>(
        `/chat/${chatId}/message`,
        { message }
      )

      // If successful, refresh chat from API
      await fetchChat()
      return // No need to use fallback
    } catch (apiError) {
      console.error("API endpoint failed:", apiError)
    }
  }

  if (loading && !chat) {
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

  // Determine which messages to display - API or local fallback
  const displayMessages = useLocalMessages
    ? localMessages
    : chat?.messages || []

  if (error && !chat && displayMessages.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  if (!chat && displayMessages.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-muted p-4 rounded-md">Chat not found</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">{chat?.title || "Chat"}</h1>
          {chat && (
            <p className="text-sm text-muted-foreground">
              {new Date(chat.createdAt).toLocaleDateString()}
            </p>
          )}
          {useLocalMessages && (
            <div className="text-xs mt-1 text-amber-500">
              Using local message display (database storage unavailable)
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            fetchChat()
            setUseLocalMessages(false)
          }}
          title="Refresh chat"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {displayMessages.length > 0 ? (
          <div className="space-y-6 py-4">
            {displayMessages.map((message, index) => (
              <Message
                key={message.id}
                message={message}
                isLatest={index === displayMessages.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground py-8">
            <div>
              <p className="mb-2">No messages yet.</p>
              <p className="text-sm">Start your conversation below.</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 my-2 px-3 py-2 text-sm bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        isDisabled={sending}
        className="border-t mt-auto"
      />
    </div>
  )
}
