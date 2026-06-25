This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Supabase)

zocare uses [Supabase](https://supabase.com) (hosted Postgres) as its database. The client
setup lives in [`lib/supabase/`](lib/supabase/) and the SQL schema in
[`supabase/schema.sql`](supabase/schema.sql).

One-time setup:

1. Create a free project at [supabase.com](https://supabase.com) (pick a region near you).
2. In the project's **Connect** modal (or **Settings → API Keys**), copy the **Project URL**
   and the **Publishable key** (`sb_publishable_…`; the legacy "anon" key also works for now).
3. Copy `.env.example` to `.env.local` and paste both values in.
4. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and **Run**. Confirm the `doctors` and
   `receptionists` tables appear under **Table Editor**.
5. Restart `npm run dev` so Next.js picks up the new environment variables.

Using it in code:

```ts
// Server Components, Server Actions, Route Handlers:
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// Client Components ("use client"):
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

> ⚠️ The schema ships with **dev-only, permissive** Row Level Security policies so you can
> build before auth exists. Tighten them before production — see the comments at the bottom of
> `supabase/schema.sql`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
