import { createClient } from "@/utils/supabase/server"
import {
  TApiResponse,
  TChat,
  TChatListItem,
  TMessage,
  TMessageRole,
  TDatabase,
} from "@/types"

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
 * Sends a user message to a specific chat
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

    // Insert the message
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        chatId,
        content: message,
        role: TMessageRole.User,
      })
      .select("*")
      .single()

    if (messageError) {
      return {
        error: messageError.message,
        status: 500,
      }
    }

    if (!messageData) {
      return {
        error: "Failed to send message",
        status: 500,
      }
    }

    // Update the chat's updatedAt timestamp
    await supabase
      .from("chats")
      .update({ updatedAt: new Date().toISOString() })
      .eq("id", chatId)

    return {
      data: {
        id: messageData.id,
        content: messageData.content,
        role: messageData.role,
        createdAt: messageData.createdAt,
        chatId: messageData.chatId,
      },
      status: 201,
    }
  } catch (error) {
    console.error("Send message error:", error)
    return {
      error: "Failed to send message",
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
