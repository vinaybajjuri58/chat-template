import { NextRequest, NextResponse } from "next/server"
import { withValidation } from "@/utils/api-middleware"
import { ChatSchemas } from "@/utils/validations"
import * as chatService from "@/api/services/chatService"

// POST /api/chat - Create a new chat
export const POST = withValidation(
  async (req: NextRequest, data: { title: string }) => {
    const result = await chatService.createChat(data.title)

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, status: "error" },
        { status: result.status }
      )
    }

    return NextResponse.json(
      { data: result.data, status: "success" },
      { status: result.status }
    )
  },
  ChatSchemas.createChat
)

// GET /api/chat - Get all chats for the user
export async function GET() {
  try {
    const result = await chatService.getChatList()

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, status: "error" },
        { status: result.status }
      )
    }

    return NextResponse.json(
      { data: result.data, status: "success" },
      { status: result.status }
    )
  } catch (error) {
    console.error("Failed to get chat list:", error)
    return NextResponse.json(
      { error: "Failed to get chat list", status: "error" },
      { status: 500 }
    )
  }
}
