"use client"

import Link from "next/link"
import { LucideMessageSquare, LucidePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { TChatListItem } from "@/types/chat"

type ChatSidebarProps = {
  chats: TChatListItem[]
  loading?: boolean
  error?: string | null
  activeChatId?: string
  onCreateChat?: () => void
  compact?: boolean
}

export function ChatSidebar({
  chats,
  loading = false,
  error = null,
  activeChatId,
  onCreateChat,
  compact = false,
}: ChatSidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full",
        compact ? "p-0" : "p-4 bg-muted/40"
      )}
    >
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          {onCreateChat && (
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={onCreateChat}
            >
              <LucidePlus className="h-4 w-4" />
              New Chat
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <div className="text-destructive text-sm">{error}</div>
      ) : chats.length === 0 ? (
        <div className="text-muted-foreground text-sm">
          No chats yet. Create a new chat to get started.
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className={cn(
                "flex items-center gap-2 rounded-md transition-colors",
                compact ? "text-sm py-1 px-2" : "p-2",
                "hover:bg-muted",
                activeChatId === chat.id ? "bg-muted" : "bg-transparent"
              )}
            >
              <LucideMessageSquare
                className={cn(
                  "text-muted-foreground",
                  compact ? "h-3 w-3" : "h-4 w-4"
                )}
              />
              <span className="truncate">{chat.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
