# Bergen Volunteer Connect

A clean, responsive Next.js, TypeScript, and Tailwind CSS site for browsing volunteer opportunities in northern Bergen County.

## Local Data

Volunteer opportunities live in [lib/opportunities.ts](lib/opportunities.ts). Add each item using the `VolunteerOpportunity` type and preserve the original wording from the source file, especially `ageDisplay`.

Use clear placeholders for uncertain details:

- `Contact organization`
- `Age varies`
- `Needs verification`

Do not invent missing ages, links, schedules, or requirements.

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
pnpm start
```
