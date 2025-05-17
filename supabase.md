# Supabase Setup Guide

This document outlines all the steps required to set up Supabase for a new project.

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

### Create Additional Tables

Create any other tables your application needs, remembering to:

1. Define appropriate relations to the profiles table
2. Set up Row Level Security (RLS) for each table
3. Create access policies based on your application's requirements

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

## 5. Storage Configuration (if needed)

1. Go to Storage > Buckets
2. Create new buckets for your application (e.g., `avatars`, `public`, `private`)
3. Configure bucket permissions:

```sql
-- Example: Create a policy to allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 6. Functions and Hooks (if needed)

1. For database triggers, go to Database > Functions
2. Create any necessary database functions and triggers
3. For serverless functions, use Edge Functions in the Supabase dashboard

## 7. Test Auth Flow

1. Go to your local development environment
2. Test authentication flows:
   - Sign up
   - Login
   - Password reset
   - Email verification

## 8. Client Integration

1. Verify Supabase client initialization in your code:

   - Server components use `createClient` from `/utils/supabase/server.ts`
   - Client components use `createClient` from `/utils/supabase/browser.ts`
   - Middleware uses `createMiddlewareClient` from `/utils/supabase/middleware-client.ts`

2. Ensure auth state synchronization is working in your application

## 9. Security Considerations

1. Review all Row Level Security (RLS) policies
2. Ensure service role key is only used for admin operations
3. Test database access with different user accounts
4. Keep the `SUPABASE_SERVICE_ROLE_KEY` secure and never expose it client-side

## 10. Production Deployment

1. Add production environment variables to your hosting platform
2. Update CORS settings in Supabase to allow your production domain
3. Ensure email settings are configured for production use

## 11. Database Migrations

For future schema changes, use one of these approaches:

1. Direct SQL through Supabase dashboard
2. Programmatic migrations using the `supabase-js` admin client
3. Supabase CLI for local development and CI/CD pipelines

## 12. Monitoring and Maintenance

1. Set up database backups (automatic in paid plans)
2. Monitor database usage in the Supabase dashboard
3. Set up alerts for approaching free tier limits if applicable
