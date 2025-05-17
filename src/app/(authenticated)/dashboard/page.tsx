"use client"

import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SignOutButton } from "@/components/SignOutButton"
import { createClient } from "@/utils/supabase/browser"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch {
        // Silently handle error
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [supabase.auth])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <SignOutButton />
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Welcome, {user?.email}</h1>

            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>

            <div className="bg-muted/50 min-h-[50vh] flex-1 rounded-xl md:min-h-min" />
          </>
        )}
      </div>
    </>
  )
}
