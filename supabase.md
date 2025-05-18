# Supabase Setup Guide

This document outlines the Supabase setup for this project.

## 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.io/)
2. Click "New Project"
3. Enter project details:
   - Name: Your project name
   - Database Password: Create a strong password
   - Region: Choose closest to your target users
   - Pricing Plan: Free tier or appropriate paid plan
4. Click "Create new project"
5. Wait for the project to be created (~2 minutes)

## 2. Configure Environment Variables

1. In your Supabase dashboard, go to Project Settings > API
2. Create a `.env.local` file in your project root with:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. For production, configure these environment variables in your hosting platform

## 3. Database Setup

### Create Auth Schema (Profiles Table)

1. Go to SQL Editor in your Supabase dashboard
2. Run the following SQL:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Create Chat Feature Tables

For the chat feature, create the following tables:

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

See the [chat.md](./chat.md) file for detailed information about the chat feature implementation.

## 4. Auth Configuration

1. Go to Authentication > Settings

### General Auth Settings

- Set Website URL to your production URL
- Configure Redirect URLs (add localhost for development)

### Email Templates

- Configure email templates for:
  - Invitation
  - Magic Link
  - Email Confirmation
  - Reset Password

### Enable Auth Providers

1. Go to Authentication > Providers
2. Configure email/password authentication (enabled by default)
3. Enable any third-party providers as needed (e.g., Google, GitHub)
4. For OAuth providers, set up redirect URLs and obtain client credentials

## 5. Client Integration

1. Verify Supabase client initialization in your code:

   - Server components use `createClient` from `/utils/supabase/server.ts`
   - Client components use `createClient` from `/utils/supabase/browser.ts`
   - Middleware uses `createMiddlewareClient` from `/utils/supabase/middleware-client.ts`

2. Ensure auth state synchronization is working in your application

## 6. Security Considerations

1. Review all Row Level Security (RLS) policies
2. Ensure service role key is only used for admin operations
3. Test database access with different user accounts
4. Keep the `SUPABASE_SERVICE_ROLE_KEY` secure and never expose it client-side

## 7. LLM Integration (OpenAI)

For the chat feature, you'll need to add an OpenAI API key to your environment variables:

```
OPENAI_API_KEY=your-openai-api-key
LLM_MODEL=gpt-3.5-turbo  # or another model of your choice
```

This will allow your application to make requests to the OpenAI API for generating responses in the chat feature.
