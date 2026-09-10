import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * SUPABASE_SERVICE_ROLE_KEY bypasses RLS entirely. `import "server-only"`
 * makes any accidental client-component import of this module fail at
 * build time rather than leak the key at runtime. Use only in ingest
 * routes and admin server actions — never for anything a visitor's request
 * can reach without going through is_admin() first.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
