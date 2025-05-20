import { createClient } from "@/utils/supabase/server"
import {
  TApiResponse,
  TChat,
  TChatListItem,
  TMessage,
  TMessageRole,
} from "@/types"
import OpenAI from "openai"
import { ChatCompletionMessageParam } from "openai/resources"

// Initialize OpenAI client with proper error handling
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  return new OpenAI({
    apiKey,
    timeout: parseInt(process.env.OPENAI_TIMEOUT || "30000", 10), // Default 30s timeout
    maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES || "3", 10), // Default 3 retries
  })
}

// Define a fallback model in case environment variable isn't set
const DEFAULT_MODEL = "gpt-3.5-turbo"

/**
 * Creates a new chat with the given title
 */
export async function createChat(title: string): Promise<TApiResponse<TChat>> {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        error: "Authentication required",
        status: 401,
      }
    }

    // Create a new chat - using snake_case for column names
    const { data, error } = await supabase
      .from("chats")
      .insert({
        title,
        user_id: user.id,
      })
      .select("*")
      .single()

    if (error) {
      return {
        error: error.message,
        status: 500,
      }
    }

    if (!data) {
      return {
        error: "Failed to create chat",
        status: 500,
      }
    }

    // Map snake_case DB columns to camelCase for our app
    return {
      data: {
        id: data.id,
        title: data.title,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      status: 201,
    }
  } catch {
    return {
      error: "Failed to create chat",
      status: 500,
    }
  }
}

/**
 * Gets a list of all chats for the current user
 */
export async function getChatList(): Promise<TApiResponse<TChatListItem[]>> {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        error: "Authentication required",
        status: 401,
      }
    }

    // Get all chats for this user - using snake_case for column names
    const { data, error } = await supabase
      .from("chats")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      return {
        error: error.message,
        status: 500,
      }
    }

    // Map snake_case DB columns to camelCase for our app
    const formattedData =
      data?.map((chat) => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
      })) || []

    return {
      data: formattedData,
      status: 200,
    }
  } catch {
    return {
      error: "Failed to retrieve chats",
      status: 500,
    }
  }
}

/**
 * Gets a specific chat by ID
 */
export async function getChatById(
  chatId: string
): Promise<TApiResponse<TChat>> {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        error: "Authentication required",
        status: 401,
      }
    }

    // Get the specific chat - using snake_case
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .eq("user_id", user.id)
      .single()

    if (chatError) {
      if (chatError.code === "PGRST116") {
        return {
          error: "Chat not found",
          status: 404,
        }
      }
      return {
        error: chatError.message,
        status: 500,
      }
    }

    if (!chatData) {
      return {
        error: "Chat not found",
        status: 404,
      }
    }

    // Fetch messages separately
    const { data: messagesData } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    const messages = Array.isArray(messagesData)
      ? messagesData.map((message) => ({
          id: message.id as string,
          content: message.content as string,
          role: message.role as TMessageRole,
          createdAt: message.created_at as string,
          chatId: message.chat_id as string,
        }))
      : []

    // Map snake_case DB columns to camelCase for our app
    return {
      data: {
        id: chatData.id,
        title: chatData.title,
        userId: chatData.user_id,
        createdAt: chatData.created_at,
        updatedAt: chatData.updated_at,
        messages,
      },
      status: 200,
    }
  } catch {
    return {
      error: "Failed to retrieve chat",
      status: 500,
    }
  }
}

/**
 * Sends a user message to a specific chat and generates AI response
 */
export async function sendMessage(
  chatId: string,
  message: string
): Promise<TApiResponse<TMessage>> {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        error: "Authentication required",
        status: 401,
      }
    }

    // Verify the chat exists and belongs to the user - using snake_case
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user_id", user.id)
      .single()

    if (chatError || !chatData) {
      return {
        error: "Chat not found or access denied",
        status: 404,
      }
    }

    try {
      // Create a timestamp for consistency
      const now = new Date().toISOString()

      const { data: userMessageData, error: messageError } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: chatId,
          content: message,
          role: TMessageRole.User,
          // Add any other required fields that might be missing
          created_at: now,
          // Remove updated_at as it doesn't exist in the table
        })
        .select("*")
        .single()

      if (messageError) {
        return {
          error: messageError?.message || "Failed to send message",
          status: 500,
        }
      }

      if (!userMessageData) {
        return {
          error: "Failed to save message to database",
          status: 500,
        }
      }

      try {
        // Initialize OpenAI client
        const openai = getOpenAIClient()
        if (!openai) {
          // Return the user message without attempting AI response
          return {
            data: {
              id: userMessageData.id,
              content: userMessageData.content,
              role: userMessageData.role,
              createdAt: userMessageData.created_at,
              chatId: userMessageData.chat_id,
            },
            status: 201,
          }
        }

        // Get chat history for context - using snake_case
        const { data: chatHistory } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true })
          .limit(50) // Limit chat history to last 50 messages for token efficiency

        // If chat history isn't available, just use the current message
        const messageHistory = chatHistory || [
          {
            role: TMessageRole.User,
            content: message,
            id: userMessageData.id,
            chat_id: chatId,
            created_at: userMessageData.created_at,
          },
        ]

        // Get model from environment variables or use default
        const model = process.env.OPENAI_MODEL || DEFAULT_MODEL

        // Generate AI response with specific error handling for OpenAI errors
        try {
          const messagesForAPI = [
            {
              role: "system",
              content:
                process.env.OPENAI_SYSTEM_PROMPT ||
                "You are a helpful assistant.",
            } as ChatCompletionMessageParam,
            ...messageHistory.map(
              (msg) =>
                ({
                  role: msg.role === TMessageRole.User ? "user" : "assistant",
                  content: msg.content,
                }) as ChatCompletionMessageParam
            ),
          ]

          const completion = await openai.chat.completions.create({
            model,
            messages: messagesForAPI,
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
            max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || "2000", 10),
          })

          const aiResponse = completion.choices[0]?.message?.content

          if (!aiResponse) {
            throw new Error("Empty response from AI model")
          }

          // Save AI response - using snake_case
          const now = new Date().toISOString() // Timestamp for consistency

          const { data: aiMessageData, error: aiMessageError } = await supabase
            .from("chat_messages")
            .insert({
              chat_id: chatId,
              content: aiResponse,
              role: TMessageRole.Assistant,
              created_at: now,
            })
            .select("*")
            .single()

          if (aiMessageError || !aiMessageData) {
            throw new Error(
              aiMessageError?.message || "Failed to save AI response"
            )
          }
        } catch {
          // Return the user message
          return {
            data: {
              id: userMessageData.id,
              content: userMessageData.content,
              role: userMessageData.role,
              createdAt: userMessageData.created_at,
              chatId: userMessageData.chat_id,
            },
            status: 201,
          }
        }

        // Update chat timestamp - using snake_case
        await supabase
          .from("chats")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", chatId)
      } catch {
        // Still return the user message since it was saved
        // This allows the client to show the user message even if AI failed
      }

      // Return the user message (AI message will be fetched separately if needed)
      return {
        data: {
          id: userMessageData.id,
          content: userMessageData.content,
          role: userMessageData.role,
          createdAt: userMessageData.created_at,
          chatId: userMessageData.chat_id,
        },
        status: 201,
      }
    } catch {
      return {
        error: "Failed to process message",
        status: 500,
      }
    }
  } catch {
    return {
      error: "Failed to process message",
      status: 500,
    }
  }
}

/**
 * Gets all messages for a specific chat
 */
export async function getChatMessages(
  chatId: string
): Promise<TApiResponse<TMessage[]>> {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        error: "Authentication required",
        status: 401,
      }
    }

    // Verify the chat exists and belongs to the user - using snake_case
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user_id", user.id)
      .single()

    if (chatError || !chatData) {
      return {
        error: "Chat not found or access denied",
        status: 404,
      }
    }

    // Get all messages for this chat - using snake_case
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    if (error) {
      return {
        error: error.message,
        status: 500,
      }
    }

    // Map to camelCase for our app
    return {
      data:
        data.map((message) => ({
          id: message.id as string,
          content: message.content as string,
          role: message.role as TMessageRole,
          createdAt: message.created_at as string,
          chatId: message.chat_id as string,
        })) || [],
      status: 200,
    }
  } catch {
    return {
      error: "Failed to retrieve messages",
      status: 500,
    }
  }
}
