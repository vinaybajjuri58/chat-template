import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

// Public routes accessible to all users
export const publicRoutes = ["/"]

// Protected routes that require authentication
export const protectedRoutes = ["/dashboard"]

// Auth routes (login/signup)
export const authRoutes = ["/login", "/signup"]

// Helper to check if a path matches any routes in an array
function isPathInRoutes(path: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match or path starts with route pattern and next char is / or end of string
    return (
      path === route ||
      (path.startsWith(route) &&
        (path.length === route.length || path[route.length] === "/"))
    )
  })
}

// Check if a path is an auth route
export function isAuthRoute(path: string): boolean {
  return isPathInRoutes(path, authRoutes)
}

// Check if a path is a protected route requiring auth
export function isProtectedRoute(path: string): boolean {
  return isPathInRoutes(path, protectedRoutes)
}

// Check if a path is a public route
export function isPublicRoute(path: string): boolean {
  return isPathInRoutes(path, publicRoutes)
}

// Server-side authentication check that will redirect if not authenticated
export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

// Server-side check to redirect authenticated users away from auth pages
export async function redirectIfAuthenticated() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }
}
