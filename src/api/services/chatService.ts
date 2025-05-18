import { createClient } from "@/utils/supabase/server"
import {
  TApiResponse,
  TChat,
  TChatListItem,
  TMessage,
  TMessageRole,
  TDatabase,
} from "@/types"
import OpenAI from "openai"
import { ChatCompletionMessageParam } from "openai/resources"
import { APIError, RateLimitError } from "openai/error"

// Initialize OpenAI client with proper error handling
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set in environment variables")
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

    // Create a new chat
    const { data, error } = await supabase
      .from("chats")
      .insert({
        title,
        userId: user.id,
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

    return {
      data: {
        id: data.id,
        title: data.title,
        userId: data.userId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      status: 201,
    }
  } catch (error) {
    console.error("Create chat error:", error)
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

    // Get all chats for this user
    const { data, error } = await supabase
      .from("chats")
      .select("id, title, createdAt, updatedAt")
      .eq("userId", user.id)
      .order("updatedAt", { ascending: false })

    if (error) {
      return {
        error: error.message,
        status: 500,
      }
    }

    return {
      data: data || [],
      status: 200,
    }
  } catch (error) {
    console.error("Get chat list error:", error)
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

    // Get the specific chat with messages
    const { data, error } = await supabase
      .from("chats")
      .select("*, messages(*)")
      .eq("id", chatId)
      .eq("userId", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return {
          error: "Chat not found",
          status: 404,
        }
      }
      return {
        error: error.message,
        status: 500,
      }
    }

    if (!data) {
      return {
        error: "Chat not found",
        status: 404,
      }
    }

    const messages = Array.isArray(data.messages)
      ? data.messages.map(
          (message: TDatabase["public"]["Tables"]["messages"]["Row"]) => ({
            id: message.id,
            content: message.content,
            role: message.role,
            createdAt: message.createdAt,
            chatId: message.chatId,
          })
        )
      : []

    // Sort messages by createdAt timestamp
    messages.sort(
      (a: TMessage, b: TMessage) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    return {
      data: {
        id: data.id,
        title: data.title,
        userId: data.userId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        messages,
      },
      status: 200,
    }
  } catch (error) {
    console.error("Get chat by ID error:", error)
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

    // Verify the chat exists and belongs to the user
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("userId", user.id)
      .single()

    if (chatError || !chatData) {
      return {
        error: "Chat not found or access denied",
        status: 404,
      }
    }

    // Insert user message
    const { data: userMessageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        chatId,
        content: message,
        role: TMessageRole.User,
      })
      .select("*")
      .single()

    if (messageError || !userMessageData) {
      return {
        error: messageError?.message || "Failed to send message",
        status: 500,
      }
    }

    try {
      // Initialize OpenAI client
      const openai = getOpenAIClient()
      if (!openai) {
        throw new Error("OpenAI client initialization failed. Check API key.")
      }

      // Get chat history for context
      const { data: chatHistory, error: historyError } = await supabase
        .from("messages")
        .select("*")
        .eq("chatId", chatId)
        .order("createdAt", { ascending: true })
        .limit(50) // Limit chat history to last 50 messages for token efficiency

      // If chat history isn't available, just use the current message
      const messageHistory = chatHistory || [
        {
          role: TMessageRole.User,
          content: message,
          id: userMessageData.id,
          chatId,
          createdAt: userMessageData.createdAt,
        },
      ]

      if (historyError) {
        console.warn(
          "Failed to retrieve chat history, using only current message:",
          historyError
        )
      }

      // Get model from environment variables or use default
      const model = process.env.OPENAI_MODEL || DEFAULT_MODEL

      // Generate AI response with specific error handling for OpenAI errors
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
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
          ],
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
          max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || "2000", 10),
        })

        const aiResponse = completion.choices[0]?.message?.content

        if (!aiResponse) {
          throw new Error("Empty response from AI model")
        }

        // Save AI response
        const { data: aiMessageData, error: aiMessageError } = await supabase
          .from("messages")
          .insert({
            chatId,
            content: aiResponse,
            role: TMessageRole.Assistant,
          })
          .select("*")
          .single()

        if (aiMessageError || !aiMessageData) {
          throw new Error(
            aiMessageError?.message || "Failed to save AI response"
          )
        }
      } catch (err) {
        // Typed error handling specific to OpenAI
        if (err instanceof APIError) {
          console.error(`OpenAI API Error: ${err.status} - ${err.name}`)

          if (err instanceof RateLimitError) {
            // Handle rate limiting specifically
            console.error(
              "Rate limit exceeded, consider upgrading your OpenAI plan"
            )
          }

          // Log headers for debugging
          console.error(`Headers: ${JSON.stringify(err.headers)}`)
        }

        // Re-throw to be caught by outer catch
        throw err
      }

      // Update chat timestamp
      await supabase
        .from("chats")
        .update({ updatedAt: new Date().toISOString() })
        .eq("id", chatId)
    } catch (aiError) {
      console.error("AI processing error:", aiError)

      // Still return the user message since it was saved
      // This allows the client to show the user message even if AI failed
    }

    // Return the user message (AI message will be fetched separately if needed)
    return {
      data: {
        id: userMessageData.id,
        content: userMessageData.content,
        role: userMessageData.role,
        createdAt: userMessageData.createdAt,
        chatId: userMessageData.chatId,
      },
      status: 201,
    }
  } catch (error) {
    console.error("Send message error:", error)
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

    // Verify the chat exists and belongs to the user
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("userId", user.id)
      .single()

    if (chatError || !chatData) {
      return {
        error: "Chat not found or access denied",
        status: 404,
      }
    }

    // Get all messages for this chat
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chatId", chatId)
      .order("createdAt", { ascending: true })

    if (error) {
      return {
        error: error.message,
        status: 500,
      }
    }

    return {
      data:
        data.map(
          (message: TDatabase["public"]["Tables"]["messages"]["Row"]) => ({
            id: message.id,
            content: message.content,
            role: message.role,
            createdAt: message.createdAt,
            chatId: message.chatId,
          })
        ) || [],
      status: 200,
    }
  } catch (error) {
    console.error("Get chat messages error:", error)
    return {
      error: "Failed to retrieve messages",
      status: 500,
    }
  }
}
