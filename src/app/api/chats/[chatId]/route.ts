import { getChatById, getChatMessages } from "@/api/services/chatService"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await context.params

  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const messagesOnly = searchParams.get("messagesOnly") === "true"

  try {
    if (messagesOnly) {
      const response = await getChatMessages(chatId)

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
    } else {
      const response = await getChatById(chatId)

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
    }
  } catch (error) {
    console.error(`GET /api/chats/${chatId} error:`, error)
    return NextResponse.json(
      { error: "Failed to retrieve chat" },
      { status: 500 }
    )
  }
}
