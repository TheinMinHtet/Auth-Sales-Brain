/**
 * Supabase clients for Next.js App Router.
 * - Browser: createBrowserClient from ./supabase/client
 * - Server: createServerClient from ./supabase/server
 */
export { createClient } from "./supabase/client";
export { createClient as createServerSupabaseClient } from "./supabase/server";
