import { type NextRequest, NextResponse } from "next/server"
import { isAuthRoute, isProtectedRoute } from "@/lib/auth"
import { createMiddlewareClient } from "@/utils/supabase/middleware-client"

export async function middleware(request: NextRequest) {
  // Get the current URL
  const path = request.nextUrl.pathname

  // Initialize response
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create supabase client using our middleware-specific function
  const supabase = createMiddlewareClient(request, response)

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // Handle protected routes - redirect to login if not authenticated
  if (isProtectedRoute(path) && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url)
    // Save the original URL as a redirect parameter
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle auth routes - redirect to dashboard if already authenticated
  if (isAuthRoute(path) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (including images)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
