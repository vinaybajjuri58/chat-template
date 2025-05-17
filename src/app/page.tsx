import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-3xl font-bold">Next.js with Separated Backend</h1>
      <p className="text-gray-600 mb-8">
        Frontend and Backend in one codebase, but clearly separated
      </p>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/users">View Users</Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/api/users">API: Get Users</Link>
        </Button>
      </div>
    </div>
  )
}
