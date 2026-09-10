import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Cookie-aware — admin and auth routes ONLY. Calling this opts the route
 * into dynamic rendering (cookies() does that), which is fine for
 * force-dynamic admin pages but would silently break ISR on public ones.
 * See public.ts for the client public/terminal pages must use instead.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — middleware/proxy refreshes
            // the session instead. Safe to ignore here.
          }
        },
      },
    }
  );
}
