# Chat Feature Implementation

This document outlines the implementation of a chat feature that allows users to interact with LLMs (Large Language Models) like OpenAI's GPT models. The implementation ensures complete privacy between users - one user cannot access another user's chats or conversation history.

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Table Relationships](#table-relationships)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [SQL Setup](#sql-setup)
6. [Implementation Steps](#implementation-steps)

## Overview

The chat feature will allow users to:

- Create new chat sessions
- Send messages to an LLM and receive responses
- View their past conversations
- Maintain privacy (users can only see their own chats)

## Database Schema

### Tables Required

We need two new tables in addition to the existing `profiles` table:

#### 1. chats

```sql
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

- `id`: Unique identifier for each chat session
- `user_id`: Foreign key linking to Supabase auth.users table
- `title`: Title of the chat session for display in the UI
- `created_at`: Timestamp when the chat was created
- `updated_at`: Timestamp when the chat was last updated

#### 2. chat_messages

```sql
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

- `id`: Unique identifier for each message
- `chat_id`: Foreign key linking to the chats table
- `content`: The actual message content
- `role`: Either 'user' or 'assistant' to differentiate between user messages and AI responses
- `created_at`: Timestamp when the message was created

## Table Relationships

The tables are related through foreign keys as follows:

```
auth.users (Supabase built-in)
      ↑
      | user_id (foreign key)
      |
   chats
      ↑
      | chat_id (foreign key)
      |
chat_messages
```

- A user can have multiple chats (one-to-many relationship)
- A chat can have multiple messages (one-to-many relationship)
- When a user is deleted, all their chats are automatically deleted (CASCADE)
- When a chat is deleted, all its messages are automatically deleted (CASCADE)

## Row Level Security (RLS)

Row Level Security is essential to ensure data privacy. We implement the following policies:

### For the chats table:

```sql
-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Users can view their own chats"
  ON public.chats FOR SELECT
  USING (auth.uid() = user_id);

-- Insert policy
CREATE POLICY "Users can insert their own chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update policy
CREATE POLICY "Users can update their own chats"
  ON public.chats FOR UPDATE
  USING (auth.uid() = user_id);

-- Delete policy
CREATE POLICY "Users can delete their own chats"
  ON public.chats FOR DELETE
  USING (auth.uid() = user_id);
```

### For the chat_messages table:

```sql
-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Users can view messages from their own chats"
  ON public.chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  ));

-- Insert policy
CREATE POLICY "Users can insert messages to their own chats"
  ON public.chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  ));

-- Update policy
CREATE POLICY "Users can update messages in their own chats"
  ON public.chat_messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  ));

-- Delete policy
CREATE POLICY "Users can delete messages from their own chats"
  ON public.chat_messages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  ));
```

These policies ensure that:

1. Users can only access their own chats
2. Users can only access messages from their own chats
3. Nested checks for message operations validate ownership through the chat relation

## SQL Setup

Run the following SQL script in your Supabase SQL Editor to set up the tables and policies:

```sql
-- Create extension for UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on tables
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chats table
CREATE POLICY "Users can view their own chats"
  ON public.chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
  ON public.chats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
  ON public.chats FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for chat_messages table
CREATE POLICY "Users can view messages from their own chats"
  ON public.chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages to their own chats"
  ON public.chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  ));

CREATE POLICY "Users can update messages in their own chats"
  ON public.chat_messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete messages from their own chats"
  ON public.chat_messages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  ));

-- Create an index on chat_id for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
```

## Implementation Steps

After running the SQL setup, the next steps for implementation will include:

1. **Chat Service Creation**:

   - Implement `src/api/services/chatService.ts` with functions to:
     - Create new chats
     - Add messages to chats
     - Retrieve chat history
     - Handle OpenAI integration

2. **API Endpoints**:

   - Endpoint to create a new chat
   - Endpoint to send a message and get an LLM response
   - Endpoint to fetch user's chats
   - Endpoint to fetch messages for a specific chat

3. **UI Components**:

   - Chat list sidebar
   - Chat interface with message history
   - Message input component
   - New chat creation button/modal

4. **LLM Integration**:

   - Integration with OpenAI or other LLM provider
   - Handling context and message history
   - Error handling for LLM requests

5. **Additional Features**:
   - Message streaming for better UX
   - Chat title generation based on content
   - Chat search functionality
   - Message reactions or editing

## TypeScript Types

Add these types to your application for TypeScript support:

```typescript
// src/types/chat.ts
export type TChat = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export type TChatMessage = {
  id: string
  chat_id: string
  content: string
  role: "user" | "assistant"
  created_at: string
}

// Request types for API endpoints
export type TCreateChatRequest = {
  title: string
}

export type TSendMessageRequest = {
  chat_id: string
  message: string
}

// Response types
export type TChatResponse = {
  chat: TChat
  messages: TChatMessage[]
}

export type TChatListResponse = {
  chats: TChat[]
}
```

## Environment Variables

Add the following environment variables for LLM integration:

```
# .env.local
OPENAI_API_KEY=your-openai-api-key
LLM_MODEL=gpt-3.5-turbo  # or another model of your choice
```
