import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ChatSchemas } from "@/utils/validations"
import * as chatService from "@/api/services/chatService"

// GET /api/chat/[chatId]/message - Get messages for a chat
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const params = await context.params
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
      throw error // Re-throw if not a ZodError
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

// Custom implementation of POST handler without withValidation to match Next.js 15 expectations
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const params = await context.params
    const chatId = params.chatId

    if (!chatId) {
      return NextResponse.json(
        {
          error: "Chat ID is required",
          status: "error",
        },
        { status: 400 }
      )
    }

    // Validate chat ID
    try {
      ChatSchemas.getChatMessages.parse({ chatId })
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
      throw error // Re-throw if not a ZodError
    }

    // Parse and validate request body
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          status: "error",
        },
        { status: 400 }
      )
    }

    // Validate message
    try {
      messageOnlySchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors,
            status: "error",
          },
          { status: 400 }
        )
      }
      throw error // Re-throw if not a ZodError
    }

    const result = await chatService.sendMessage(chatId, body.message)

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
  } catch (error) {
    console.error("Failed to send message:", error)
    return NextResponse.json(
      { error: "Failed to send message", status: "error" },
      { status: 500 }
    )
  }
}
