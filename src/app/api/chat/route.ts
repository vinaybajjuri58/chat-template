import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ChatSchemas } from "@/utils/validations"
import * as chatService from "@/api/services/chatService"

// POST /api/chat - Create a new chat
export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          status: "error",
        },
        { status: 400 }
      )
    }

    // Validate against schema
    try {
      const validatedData = ChatSchemas.createChat.parse(body)
      const result = await chatService.createChat(validatedData.title)

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
      throw error
    }
  } catch (error) {
    console.error("Failed to create chat:", error)
    return NextResponse.json(
      { error: "Failed to create chat", status: "error" },
      { status: 500 }
    )
  }
}

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
