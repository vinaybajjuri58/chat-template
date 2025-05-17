import { getUsers } from "@/api/services/userService"
import { NextResponse } from "next/server"

export async function GET() {
  const result = await getUsers()

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json(result.data, { status: result.status })
}
