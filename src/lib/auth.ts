import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

// Define all protected routes
export const protectedRoutes = [
  "/dashboard",
  "/account",
  "/settings",
  "/profile",
]

// Define public routes that should be accessible even when logged in
export const publicRoutes = ["/", "/about", "/contact"]

// Define auth routes (login/signup)
export const authRoutes = ["/login", "/signup", "/reset-password"]

// Helper to check if a path matches any of the routes in the routes array
export function isPathInRoutes(path: string, routes: string[]): boolean {
  return routes.some((route) => path === route || path.startsWith(`${route}/`))
}

// Check if a path is a protected route
export function isProtectedRoute(path: string): boolean {
  return isPathInRoutes(path, protectedRoutes)
}

// Check if a path is an auth route
export function isAuthRoute(path: string): boolean {
  return isPathInRoutes(path, authRoutes)
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

// Server-side check that will redirect authenticated users away from auth pages
export async function redirectIfAuthenticated() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return user
}
