import { z } from "zod"

// Generic validation wrapper for API handlers
export const validateRequest = async <T>(
  schema: z.ZodType<T>,
  data: unknown
): Promise<{ data: T; error: null } | { data: null; error: z.ZodError }> => {
  try {
    const validatedData = schema.parse(data)
    return { data: validatedData, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error }
    }
    // Re-throw unexpected errors
    throw error
  }
}

// Chat service validation schemas
export const ChatSchemas = {
  createChat: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title cannot exceed 100 characters"),
  }),

  getChatById: z.object({
    chatId: z
      .string()
      .uuid("Invalid chat ID format")
      .min(1, "Chat ID is required"),
  }),

  sendMessage: z.object({
    chatId: z
      .string()
      .uuid("Invalid chat ID format")
      .min(1, "Chat ID is required"),
    message: z
      .string()
      .min(1, "Message content is required")
      .max(4000, "Message cannot exceed 4000 characters"),
  }),

  getChatMessages: z.object({
    chatId: z
      .string()
      .uuid("Invalid chat ID format")
      .min(1, "Chat ID is required"),
  }),
}

// Types for validated data
export type CreateChatParams = z.infer<typeof ChatSchemas.createChat>
export type GetChatByIdParams = z.infer<typeof ChatSchemas.getChatById>
export type SendMessageParams = z.infer<typeof ChatSchemas.sendMessage>
export type GetChatMessagesParams = z.infer<typeof ChatSchemas.getChatMessages>

// Format Zod errors into a user-friendly format
export const formatZodError = (
  error: z.ZodError
): { message: string; path: string }[] => {
  return error.errors.map((err) => ({
    message: err.message,
    path: err.path.join("."),
  }))
}
