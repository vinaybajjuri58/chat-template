"use client"
import { User } from "@/api/utils/types"
import { fetchFromApi } from "@/utils/api"
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
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <h1 className="text-xl font-semibold">Users</h1>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {loading && <p>Loading users...</p>}
        {error && <p className="text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="grid gap-4">
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg shadow-sm">
                  <h2 className="font-medium">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}
