import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./types";

/** Public routes — reachable without a Supabase session. */
const PUBLIC_ROUTES = [
  "/doctor/signin",
  "/doctor/signup",
  "/doctor/forgot-password",
  "/receptionist/login",
];

const isPublic = (pathname: string) =>
  pathname === "/" || PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

/**
 * Refreshes the Supabase session cookie on every request and gates the two
 * portals. Called from the root `proxy.ts` (Next.js 16 renamed Middleware to
 * Proxy — same functionality).
 *
 * The cookie dance below is required: Supabase rotates the refresh token, and
 * the new token has to be written onto BOTH the outgoing request (so Server
 * Components in this same render see it) and the response (so the browser
 * stores it).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (err) {
    // Transient network blip talking to Supabase's edge (e.g. a dropped
    // keep-alive socket) — don't fail the whole request over it, just treat
    // this pass as unauthenticated and let the next request retry.
    console.warn("[proxy] supabase.auth.getUser() failed, treating as signed out:", err);
  }

  const { pathname } = request.nextUrl;
  const role = (user?.user_metadata?.role as string | undefined) ?? null;

  // Signed out and asking for a protected page → back to the right login screen.
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/receptionist")
      ? "/receptionist/login"
      : "/doctor/signin";
    return NextResponse.redirect(url);
  }

  // Signed in but standing on a login screen → straight to their dashboard.
  if (user && isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = role === "receptionist" ? "/receptionist/queue" : "/doctor/queue";
    return NextResponse.redirect(url);
  }

  // Signed in, wrong portal → send them to their own.
  if (user && role) {
    const wantsDoctor = pathname.startsWith("/doctor");
    const wantsReception = pathname.startsWith("/receptionist");
    if (wantsDoctor && role !== "doctor") {
      const url = request.nextUrl.clone();
      url.pathname = "/receptionist/queue";
      return NextResponse.redirect(url);
    }
    if (wantsReception && role !== "receptionist") {
      const url = request.nextUrl.clone();
      url.pathname = "/doctor/queue";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
