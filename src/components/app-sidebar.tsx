"use client"

import * as React from "react"
import { LayoutDashboard, MessageSquare, PlusCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { SignOutButton } from "@/components/SignOutButton"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { fetchFromApi, postToApi } from "@/utils/api"
import { TChatListItem } from "@/types/chat"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCreating, setIsCreating] = useState(false)
  const [chats, setChats] = useState<TChatListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Extract the current chat ID from the path if we're on a chat page
  const currentChatId = pathname.startsWith("/chat/")
    ? pathname.split("/")[2]
    : undefined

  useEffect(() => {
    async function fetchChats() {
      try {
        setIsLoading(true)
        const data = await fetchFromApi<{ data: TChatListItem[] }>("/chats")
        setChats(data.data || [])
      } catch (err) {
        console.error("Error fetching chats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChats()
  }, [])

  async function handleCreateNewChat() {
    try {
      setIsCreating(true)

      // Generate a sequential title based on the number of existing chats
      const chatNumber = chats.length + 1
      const chatTitle = `Chat ${chatNumber}`

      const data = await postToApi<{ data: { id: string } }, { title: string }>(
        "/chats",
        {
          title: chatTitle,
        }
      )

      // Update the local chats list with the new chat
      const newChat = {
        id: data.data.id,
        title: chatTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setChats([newChat, ...chats])

      // Navigate to the new chat
      router.push(`/chat/${data.data.id}`)
    } catch (err) {
      console.error("Error creating new chat:", err)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">AI Chat App</span>
                  <span className="text-xs">Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 py-2">
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={handleCreateNewChat}
            disabled={isCreating}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {isCreating ? "Creating..." : "New Chat"}
          </Button>
        </div>

        <div className="mt-2 px-2">
          <div className="text-xs font-medium text-muted-foreground px-3 py-1">
            Your Chats
          </div>

          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : chats.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No chats yet
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                    "hover:bg-muted",
                    currentChatId === chat.id
                      ? "bg-muted font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="truncate">{chat.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <SignOutButton className="w-full justify-start" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
