import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  // Create a supabase client specifically for middleware
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Update the response cookies
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string) {
          // Next.js cookies.delete only accepts the name
          request.cookies.delete(name)
          response.cookies.delete(name)
        },
      },
    }
  )
}
