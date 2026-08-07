import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./types";

/**
 * Supabase client for use on the server: Server Components, Server Actions,
 * and Route Handlers. Credentials never reach the browser.
 *
 * `cookies()` is async in Next.js 16, so this helper is async too — always await it:
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 *
 * The cookie `getAll`/`setAll` plumbing below is what lets Supabase Auth persist
 * a session later. There is no session yet (auth is off), so it's effectively a
 * no-op for now — but wiring it in now means adding login later needs no changes here.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` was called from a Server Component, which can't write
            // cookies. Safe to ignore once you add middleware to refresh
            // sessions (only relevant after you turn on auth).
          }
        },
      },
    },
  );
}
