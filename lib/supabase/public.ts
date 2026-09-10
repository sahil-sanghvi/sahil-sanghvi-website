import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * No cookie adapter — used by every (site) and terminal page. Calling
 * cookies() (which the SSR client does) opts a route into dynamic
 * rendering, which silently breaks ISR on every public page. This client
 * never touches cookies, so those routes stay static. RLS still applies via
 * the anon role and its published-only policies, so this is not a security
 * downgrade — just a caching one, in the right direction.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
