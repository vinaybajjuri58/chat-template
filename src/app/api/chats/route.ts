import { getChatList, createChat } from "@/api/services/chatService"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await getChatList()

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json(
      { data: response.data },
      { status: response.status }
    )
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json()

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const response = await createChat(title)

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json(
      { data: response.data },
      { status: response.status }
    )
  } catch {
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    )
  }
}
