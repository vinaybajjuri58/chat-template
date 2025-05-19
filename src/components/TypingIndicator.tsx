"use client"

import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"

type TypingIndicatorProps = {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex w-full py-1.5 justify-start pr-8 sm:pr-16 md:pr-24 animate-pulse",
        className
      )}
    >
      <div className="flex items-end gap-2">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border bg-accent text-accent-foreground">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex flex-col rounded-xl px-3.5 py-2.5 max-w-[70%] sm:max-w-[75%] md:max-w-[80%] shadow-sm bg-accent text-accent-foreground">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="text-xs font-medium">Assistant</div>
            <div className="text-xs text-accent-foreground/70">thinking...</div>
          </div>
          <div className="mt-1 text-accent-foreground">
            <div className="flex space-x-1 mt-2">
              <div className="h-2 w-2 rounded-full bg-accent-foreground/50 animate-bounce"></div>
              <div className="h-2 w-2 rounded-full bg-accent-foreground/50 animate-bounce [animation-delay:0.2s]"></div>
              <div className="h-2 w-2 rounded-full bg-accent-foreground/50 animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
