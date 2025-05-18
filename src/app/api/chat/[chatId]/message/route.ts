import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { withValidation } from "@/utils/api-middleware"
import { ChatSchemas } from "@/utils/validations"
import * as chatService from "@/api/services/chatService"

// GET /api/chat/[chatId]/message - Get messages for a chat
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    // Validate URL parameters
    try {
      // Validate chat ID format
      ChatSchemas.getChatMessages.parse(params)
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

    const result = await chatService.getChatMessages(params.chatId)

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
    console.error("Failed to get chat messages:", error)
    return NextResponse.json(
      { error: "Failed to get chat messages", status: "error" },
      { status: 500 }
    )
  }
}

// Create a message-only schema for validation
const messageOnlySchema = z.object({
  message: ChatSchemas.sendMessage.shape.message,
})

// POST /api/chat/[chatId]/message - Send a message
export const POST = withValidation(
  async (
    req: NextRequest,
    data: { message: string },
    context: { params: { chatId: string } }
  ) => {
    // Validate that the URL parameter chatId is a valid UUID
    try {
      ChatSchemas.getChatMessages.parse({ chatId: context.params.chatId })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid chat ID in URL",
            details: error.errors,
            status: "error",
          },
          { status: 400 }
        )
      }
    }

    const result = await chatService.sendMessage(
      context.params.chatId,
      data.message
    )

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, status: "error" },
        { status: result.status }
      )
    }

    return NextResponse.json(
      { data: result.data, status: "success" },
      { status: 201 }
    )
  },
  messageOnlySchema
)
