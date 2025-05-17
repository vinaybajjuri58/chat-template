import { getUserById } from "@/api/services/userService"
import { RouteContext } from "@/api/utils/types"
import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: RouteContext) {
  const result = await getUserById(params.id)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json(result.data, { status: result.status })
}
