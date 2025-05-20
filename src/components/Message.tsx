"use client"

import { TMessage, TMessageRole } from "@/types/chat"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { AlertCircle, User, Bot } from "lucide-react"
import { useState, useMemo, ReactNode } from "react"
import ReactMarkdown, { Options } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

// Custom type for code component props
type TCodeProps = {
  inline?: boolean
  className?: string
  children?: ReactNode
}

type TMessageProps = {
  message: TMessage
  isLatest?: boolean
}

export function Message({ message, isLatest = false }: TMessageProps) {
  const [isError, setIsError] = useState<boolean>(false)
  const isUserMessage = message.role === TMessageRole.User

  let formattedTime: string
  try {
    formattedTime = format(new Date(message.createdAt), "h:mm a")
  } catch {
    formattedTime = "Unknown time"
  }

  const MarkdownContent = useMemo(() => {
    try {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm] as Options["remarkPlugins"]}
          rehypePlugins={[rehypeRaw] as Options["rehypePlugins"]}
          components={{
            p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            a: ({ ...props }) => (
              <a
                className={cn(
                  isUserMessage
                    ? "text-primary-foreground/90 underline hover:text-primary-foreground"
                    : "text-primary hover:text-primary/80"
                )}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            code: ({ inline, className, children, ...props }: TCodeProps) => {
              const match = /language-(\w+)/.exec(className || "")
              const codeBlockClasses =
                "rounded-md p-3 my-2 text-sm overflow-x-auto"
              const inlineCodeClasses = "px-1 py-0.5 rounded text-sm"

              // Use theme-aware colors for code blocks
              const userCodeBg =
                "bg-primary-foreground/20 text-primary-foreground"
              const assistantCodeBg =
                "bg-muted text-accent-foreground dark:text-accent-foreground"

              const currentBgClass = isUserMessage
                ? userCodeBg
                : assistantCodeBg

              if (inline) {
                return (
                  <code
                    className={cn(className, inlineCodeClasses, currentBgClass)}
                    {...props}
                  >
                    {children}
                  </code>
                )
              }

              // For fenced code blocks, ensure children are treated as plain text
              type FencedCodeBlockProps = {
                children?: ReactNode
              }

              const FencedCodeBlock = ({ children }: FencedCodeBlockProps) => (
                <pre
                  className={cn(className, codeBlockClasses, currentBgClass)}
                  {...props}
                >
                  <code className={cn("font-mono", className)}>{children}</code>
                </pre>
              )

              return match ? (
                <FencedCodeBlock>
                  {String(children).replace(/\n$/, "")}
                </FencedCodeBlock>
              ) : (
                <FencedCodeBlock>
                  {String(children).replace(/\n$/, "")}
                </FencedCodeBlock>
              )
            },
            ul: ({ ...props }) => (
              <ul className="list-disc pl-5 my-2" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal pl-5 my-2" {...props} />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      )
    } catch (e) {
      console.error("Error rendering markdown:", e)
      setIsError(true)
      return null
    }
  }, [message.content, isUserMessage])

  return (
    <div
      className={cn(
        "flex w-full py-1.5",
        isUserMessage
          ? "justify-end pl-8 sm:pl-16 md:pl-24"
          : "justify-start pr-8 sm:pr-16 md:pr-24",
        isLatest && "animate-in fade-in duration-300"
      )}
    >
      <div
        className={cn(
          "flex items-end gap-2",
          isUserMessage && "flex-row-reverse"
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
            isUserMessage
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
          )}
        >
          {isUserMessage ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>

        <div
          className={cn(
            "flex flex-col rounded-xl px-3.5 py-2.5 max-w-[70%] sm:max-w-[75%] md:max-w-[80%] shadow-sm",
            isUserMessage
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
          )}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="text-xs font-medium">
              {isUserMessage ? "You" : "Assistant"}
            </div>
            <div
              className={cn(
                "text-xs",
                isUserMessage
                  ? "text-primary-foreground/70"
                  : "text-accent-foreground/70"
              )}
            >
              {formattedTime}
            </div>
          </div>

          <div
            className={cn(
              "prose prose-sm dark:prose-invert break-words",
              isUserMessage
                ? "text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground prose-ul:text-primary-foreground prose-ol:text-primary-foreground prose-li:text-primary-foreground"
                : "text-accent-foreground prose-headings:text-accent-foreground prose-strong:text-accent-foreground prose-ul:text-accent-foreground prose-ol:text-accent-foreground prose-li:text-accent-foreground"
            )}
          >
            {isError ? (
              <div
                className={cn(
                  "font-medium",
                  isUserMessage
                    ? "text-destructive-foreground"
                    : "text-destructive"
                )}
              >
                <AlertCircle className="h-4 w-4 inline-block mr-1" />
                Error rendering content
              </div>
            ) : (
              MarkdownContent
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
