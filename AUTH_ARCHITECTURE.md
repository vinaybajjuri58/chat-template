# Authentication Architecture

This document outlines the authentication architecture for our Next.js application, including directory structure, flow, and file responsibilities.

## Directory Structure

The authentication system is organized as follows:

- `/app/(auth)/*` - Contains auth UI routes (login, signup)
- `/app/auth/*` - Contains auth callback handlers and verification endpoints
- `/api/services/authService.ts` - Core authentication business logic
- `/lib/auth.ts` - Authentication helpers and route definitions
- `/middleware.ts` - Route protection and auth redirects
- `/utils/supabase/*` - Supabase client utilities

## Authentication Flow

1. **User Registration**:

   - User submits signup form
   - `authService.signup()` creates the user in Supabase Auth
   - User is automatically signed in after registration, regardless of email verification status
   - A profile record is created in the `profiles` table
   - User is redirected to the dashboard

2. **User Login**:

   - User submits login form
   - `authService.login()` first checks if the email exists in the system
   - If email is not found, user is prompted to sign up instead
   - If email exists, authenticates with Supabase
   - Authentication succeeds if the user exists, even if email is not verified
   - The system checks for a matching profile and creates one if missing
   - User is redirected to the dashboard

3. **Email Verification**:

   - Not required for login, but email verification is still available
   - Verification emails include a link to `/auth/confirm`
   - After verification, the user is redirected to the dashboard

4. **Route Protection**:
   - Protected routes (`/dashboard`) are defined in `/lib/auth.ts`
   - `middleware.ts` enforces authentication for protected routes
   - Unauthenticated users are redirected to login with a return URL

## Route Configuration

- **Public Routes**: `["/"]`

  - Accessible to all users, authenticated or not

- **Auth Routes**: `["/login", "/signup"]`

  - Authentication-related pages
  - Authenticated users are redirected to dashboard

- **Protected Routes**: `["/dashboard"]`
  - Require authentication
  - Unauthenticated users are redirected to login

## Key Files and Responsibilities

### Core Auth Logic

- **`/api/services/authService.ts`**:
  - Implements signup, login, and signout
  - Handles profile creation and management

### Route Protection & Middleware

- **`/lib/auth.ts`**:

  - Defines protected/public/auth routes
  - Provides helper functions for route checking
  - `isAuthRoute()`, `isProtectedRoute()`, `isPublicRoute()`

- **`/middleware.ts`**:
  - Intercepts requests to check authentication status
  - Redirects users based on auth status and route type

### Supabase Integration

- **`/utils/supabase/server.ts`**:
  - Creates Supabase client for server components
- **`/utils/supabase/middleware-client.ts`**:

  - Creates Supabase client for middleware

- **`/utils/supabase/middleware.ts`**:
  - Handles auth token refreshing

## Database Schema

The authentication system uses a `profiles` table with this structure:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Best Practices

1. Always use the appropriate Supabase client:

   - Server components: `createClient` from `/utils/supabase/server.ts`
   - Middleware: `createMiddlewareClient` from `/utils/supabase/middleware-client.ts`

2. Never store sensitive information in the profile:

   - The `profiles` table should only contain non-sensitive user data
   - Authentication data is managed by Supabase Auth

3. Consistent token handling:
   - Use `session?.access_token` consistently throughout the application
   - Don't mix different token formats
