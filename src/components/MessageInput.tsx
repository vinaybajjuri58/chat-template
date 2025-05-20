"use client"

import { useState, FormEvent } from "react"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type TMessageInputProps = {
  onSendMessage: (message: string) => Promise<void>
  isDisabled?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({
  onSendMessage,
  isDisabled = false,
  placeholder = "Type your message...",
  className,
}: TMessageInputProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!message.trim() || isSending) {
      return
    }

    try {
      setIsSending(true)
      await onSendMessage(message.trim())
      setMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
      // Error is handled by the parent component
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-end gap-2 border-t bg-background p-4",
        className
      )}
    >
      <div className="relative flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled || isSending}
          rows={1}
          className="min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
      </div>
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isDisabled || isSending}
        className="h-10 w-10 shrink-0 rounded-full"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  )
}
