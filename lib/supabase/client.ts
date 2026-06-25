import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

/**
 * Supabase client for use in Client Components (runs in the browser).
 *
 * Usage:
 *   "use client";
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
