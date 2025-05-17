import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"

// This layout is for public pages like home, about, etc.
export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <div className="flex flex-col min-h-svh">
      {/* Public header */}
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            YourApp
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} YourApp. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
