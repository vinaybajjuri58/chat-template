export enum TMessageRole {
  User = "user",
  Assistant = "assistant",
}

export type TMessage = {
  id: string
  content: string
  role: TMessageRole
  createdAt: string
  chatId: string
}

export type TChat = {
  id: string
  title: string
  userId: string
  createdAt: string
  updatedAt: string
  messages?: TMessage[]
}

export type TChatListItem = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export type TDatabase = {
  public: {
    Tables: {
      chats: {
        Row: TChat
        Insert: Omit<TChat, "id" | "createdAt" | "updatedAt">
        Update: Partial<Omit<TChat, "id" | "createdAt">>
      }
      chat_messages: {
        Row: TMessage
        Insert: Omit<TMessage, "id" | "createdAt">
        Update: Partial<Omit<TMessage, "id" | "createdAt" | "chatId">>
      }
      users: {
        Row: {
          id: string
          email: string
          createdAt: string
        }
        Insert: {
          id: string
          email: string
        }
        Update: Partial<{
          email: string
        }>
      }
    }
  }
}

export type TTables<T extends keyof TDatabase["public"]["Tables"]> =
  TDatabase["public"]["Tables"][T]["Row"]

export type TNewChat = TDatabase["public"]["Tables"]["chats"]["Insert"]
export type TNewMessage =
  TDatabase["public"]["Tables"]["chat_messages"]["Insert"]
