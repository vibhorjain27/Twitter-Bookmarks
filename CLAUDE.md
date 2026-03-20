@AGENTS.md

# Twitter Bookmarks Reader — Project Guide

A personal web app to browse, curate, scrape, summarize, and listen to Twitter/X bookmarks.
Zero-cost stack: no paid APIs, no terminal required — fully managed via web UIs.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Hosting | Vercel (free tier, deploy via GitHub) |
| Database | PostgreSQL via Supabase (free tier) + Prisma ORM v7 |
| Twitter import | Chrome extension export → manual JSON upload in-app |
| AI Summarization | Groq API free tier (`llama-3.1-8b-instant`) |
| Text-to-Speech | Browser Web Speech API (client-side, free) |
| UI | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| State | TanStack Query (server state) |

## Deployment (no terminal needed)

### Step 1 — Supabase database
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project (free tier)
3. Go to **Settings → Database → Connection string (URI)**
4. Copy the full `postgresql://...` connection string — this is your `DATABASE_URL`

### Step 2 — Groq API key
1. Create account at [console.groq.com](https://console.groq.com) (free, no credit card)
2. Go to **API Keys → Create API Key**
3. Copy the key starting with `gsk_...` — this is your `GROQ_API_KEY`

### Step 3 — Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project** and import this repository
3. In the **Environment Variables** section, add:
   - `DATABASE_URL` = your Supabase connection string
   - `GROQ_API_KEY` = your Groq key
4. Click **Deploy**
5. Vercel runs `prisma generate && prisma db push && next build` automatically — this creates all database tables in Supabase

### Step 4 — Import Twitter bookmarks (in-app, no terminal)
1. In Chrome, install a bookmark exporter extension (search Chrome Web Store for "Twitter bookmark export")
2. Go to twitter.com/i/bookmarks while logged in
3. Click the extension → export as JSON
4. In the app, click **Import Bookmarks** and drop the JSON file

## Environment Variables

| Variable | Description | Where to get |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection URI | supabase.com → Settings → Database |
| `GROQ_API_KEY` | Groq free-tier API key | console.groq.com → API Keys |

## Project Structure

```
app/
  page.tsx                    → Redirect to /bookmarks
  bookmarks/page.tsx          → Browse + import Twitter bookmarks
  articles/page.tsx           → Curated article list
  articles/[id]/page.tsx      → Article detail: read, summarize, listen
  api/bookmarks/route.ts      → GET: list bookmarks (paginated)
  api/bookmarks/upload/       → POST: accept JSON file import
  api/articles/route.ts       → GET: list articles, POST: add to list
  api/articles/[id]/route.ts  → GET: article detail, DELETE: remove
  api/articles/[id]/scrape/   → POST: scrape URL via Readability
  api/summarize/route.ts      → POST: stream Groq AI summary

components/
  NavBar.tsx                  → Top navigation
  BookmarkCard.tsx            → Bookmark card with add/remove action
  UploadModal.tsx             → Drag-and-drop JSON import modal
  SummaryPanel.tsx            → Streaming AI summary with regenerate
  AudioPlayer.tsx             → Web Speech API player with controls

lib/
  db.ts                       → Prisma singleton (lazy init, adapter-pg)
  scraper.ts                  → @mozilla/readability + jsdom article scraper
  groq.ts                     → Groq streaming client
```

## Key Patterns

### Route Handler params (Next.js 16)
`params` is a **Promise** and must be awaited:
```ts
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### Prisma v7 with adapter
No `url` in schema.prisma — connection is configured in `prisma.config.ts`
and the adapter is passed to the `PrismaClient` constructor in `lib/db.ts`.

### Streaming Groq response
`/api/summarize` returns a `ReadableStream` of text chunks.
The client reads chunk-by-chunk and appends to state for live typewriter effect.

### TanStack Query keys
- `['bookmarks', page]` — paginated bookmark list
- `['articles', page]` — paginated article list
- `['article', id]` — single article detail

### Prisma model notes
- `Bookmark.urls` and `Bookmark.mediaUrls` are stored as JSON arrays
- Deleting from article list sets `addedToList = false` (soft delete)
- Cascade delete: deleting a bookmark also deletes its linked article

## Groq Model

Currently using `llama-3.1-8b-instant`. To change, edit `lib/groq.ts`.
Free-tier models: `llama-3.1-8b-instant` (fastest), `llama-3.3-70b-versatile` (better quality).

## Database Commands (for AI assistants modifying schema)

After changing `prisma/schema.prisma`, the next Vercel deploy will auto-apply changes
via `prisma db push` in the build script. No manual migration needed.
