"use client"

import { TMessage, TMessageRole } from "@/types/chat"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { AlertCircle, User, Bot } from "lucide-react"
import { useState } from "react"

type TMessageProps = {
  message: TMessage
  isLatest?: boolean
}

export function Message({ message, isLatest = false }: TMessageProps) {
  const [isError, setIsError] = useState<boolean>(false)

  // Format the timestamp
  let formattedTime: string
  try {
    formattedTime = format(new Date(message.createdAt), "h:mm a")
  } catch (error) {
    formattedTime = "Unknown time"
  }

  // Handle rendering markdown content if there's an error
  const renderContent = () => {
    try {
      return (
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      )
    } catch (error) {
      setIsError(true)
      return (
        <div className="text-destructive">
          <AlertCircle className="h-4 w-4 inline-block mr-2" />
          Error rendering message content
        </div>
      )
    }
  }

  const isUserMessage = message.role === TMessageRole.User

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 py-4",
        isLatest && "animate-in fade-in duration-300"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border",
          isUserMessage
            ? "bg-background text-primary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isUserMessage ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <div className="font-semibold">
            {isUserMessage ? "You" : "Assistant"}
          </div>
          <div className="text-xs text-muted-foreground">{formattedTime}</div>
        </div>
        <div className={cn("mt-1", isError && "text-destructive")}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
