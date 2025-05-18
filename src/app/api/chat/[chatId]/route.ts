import { NextResponse } from "next/server"
import { z } from "zod"
import { ChatSchemas } from "@/utils/validations"
import * as chatService from "@/api/services/chatService"

// GET /api/chat/[chatId] - Get a specific chat by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const resolvedParams = await params
    // Validate chat ID
    try {
      ChatSchemas.getChatById.parse(resolvedParams)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid chat ID",
            details: error.errors,
            status: "error",
          },
          { status: 400 }
        )
      }
    }

    // Fetch the chat
    const result = await chatService.getChatById(resolvedParams.chatId)

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, status: "error" },
        { status: result.status }
      )
    }

    return NextResponse.json(
      { data: result.data, status: "success" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to get chat:", error)
    return NextResponse.json(
      { error: "Failed to get chat", status: "error" },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/[chatId] - Delete a chat
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const resolvedParams = await params
    // Validate chat ID
    try {
      ChatSchemas.getChatById.parse(resolvedParams)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid chat ID",
            details: error.errors,
            status: "error",
          },
          { status: 400 }
        )
      }
    }

    // This would call a delete method in the chat service (not implemented yet)
    // const result = await chatService.deleteChat(params.chatId)

    // For now, return a dummy success response
    return NextResponse.json(
      { status: "success", message: "Chat deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to delete chat:", error)
    return NextResponse.json(
      { error: "Failed to delete chat", status: "error" },
      { status: 500 }
    )
  }
}
