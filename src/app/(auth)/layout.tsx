import Link from "next/link"
import { redirectIfAuthenticated } from "@/lib/auth"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/Footer"

// This layout is for auth pages like login, signup, reset password
export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side redirect if already authenticated
  await redirectIfAuthenticated()

  return (
    <div className="flex flex-col min-h-svh">
      {/* Public header */}
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            YourApp
          </Link>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
