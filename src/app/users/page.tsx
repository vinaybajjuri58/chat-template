"use client"
import { User } from "@/api/utils/types"
import { Button } from "@/components/ui/button"
import { fetchFromApi } from "@/utils/api"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await fetchFromApi<User[]>("users")
        setUsers(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-4">
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg shadow-sm">
                <h2 className="font-medium">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
