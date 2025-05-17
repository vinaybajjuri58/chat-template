import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin operations
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
