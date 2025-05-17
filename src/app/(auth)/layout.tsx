import { redirectIfAuthenticated } from "@/lib/auth"

// This layout is for auth pages like login, signup, reset password
export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side redirect if already authenticated
  await redirectIfAuthenticated()

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-50">
      {children}
    </div>
  )
}
