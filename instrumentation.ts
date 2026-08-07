export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Cloudflare (fronting Supabase) closes idle keep-alive sockets sooner than
  // undici's default keepAliveTimeout expects, which surfaces as intermittent
  // "other side closed" / ECONNRESET fetch failures when a stale pooled
  // connection gets reused. Keeping our own timeout well under Cloudflare's
  // avoids ever reusing a connection it's already dropped.
  const { setGlobalDispatcher, Agent } = await import("undici");
  setGlobalDispatcher(
    new Agent({
      keepAliveTimeout: 4_000,
      keepAliveMaxTimeout: 4_000,
    }),
  );
}
