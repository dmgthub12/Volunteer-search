# Bergen Volunteer Connect

A clean, responsive Next.js, TypeScript, and Tailwind CSS site for browsing volunteer opportunities in northern Bergen County.

## Local Data

Volunteer opportunities live in [lib/opportunities.ts](lib/opportunities.ts). Add each item using the `VolunteerOpportunity` type and preserve the original wording from the source file, especially `ageDisplay`.

Use clear placeholders for uncertain details:

- `Contact organization`
- `Age varies`
- `Needs verification`

Do not invent missing ages, links, schedules, or requirements.

## Supabase Setup

The site can read opportunities from Supabase when these environment variables are set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Create a Supabase project, then run these files in the Supabase SQL editor:

1. [supabase/schema.sql](supabase/schema.sql)
2. [supabase/seed-opportunities.sql](supabase/seed-opportunities.sql)

The app falls back to [lib/opportunities.ts](lib/opportunities.ts) if Supabase is not configured, so local development still works without credentials.

To regenerate the seed file after editing the local data:

```bash
node scripts/print-supabase-seed.mjs
```

## Private Analytics

The site records anonymous page views and button/link clicks in Supabase when the public Supabase variables are configured. It does not collect names, emails, or form data.

Run [supabase/schema.sql](supabase/schema.sql) in Supabase again to create the `site_events` table. Public visitors can insert analytics events, but they cannot read them.

To view analytics privately, add your service-role key to `.env.local` on your computer only:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Do not add `SUPABASE_SERVICE_ROLE_KEY` to Vercel, GitHub, or any `NEXT_PUBLIC_` variable.

Start the local dashboard:

```bash
pnpm analytics
```

Open [http://localhost:4310](http://localhost:4310). Leave that terminal running when you want the dashboard available on your computer.

## Vercel Setup

Import this repository into Vercel and use the included [vercel.json](vercel.json):

- Framework preset: Next.js
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: `out`

Add the Supabase environment variables above in Vercel Project Settings > Environment Variables, then redeploy.

## Pages

- `/` home page
- `/opportunities` searchable and filterable opportunity list
- `/opportunities/[id]` full opportunity details
- `/about` project context and verification reminder

## Run Locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
pnpm build
```
