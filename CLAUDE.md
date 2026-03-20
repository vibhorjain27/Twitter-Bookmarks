@AGENTS.md

# Twitter Bookmarks Reader — Project Guide

A personal web app to browse, curate, scrape, summarize, and listen to Twitter/X bookmarks.
Zero-cost stack: no paid APIs, no paid hosting required.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL via Supabase (free tier) + Prisma ORM |
| Twitter access | Playwright browser automation + manual JSON upload |
| AI Summarization | Groq API free tier (`llama-3.1-8b-instant`) |
| Text-to-Speech | Browser Web Speech API (client-side, free) |
| UI | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| State | TanStack Query (server state) + Zustand (UI state) |

## Quick Start

```bash
# 1. Copy env template and fill in values
cp .env.example .env.local

# 2. Generate Prisma client
npm run db:generate

# 3. Push schema to Supabase
npm run db:push

# 4. Start dev server
npm run dev

# 5. One-time: save your Twitter session (opens browser)
npm run save-twitter-session
```

## Environment Variables

| Variable | Description | Where to get |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection URI | supabase.com > Settings > Database |
| `GROQ_API_KEY` | Groq free-tier API key | console.groq.com > API Keys |
| `TWITTER_COOKIES_PATH` | Path to saved Twitter session JSON | Default: `./twitter-cookies.json` |

## Project Structure

```
app/
  page.tsx                    → Redirect to /bookmarks
  bookmarks/page.tsx          → Browse all Twitter bookmarks
  articles/page.tsx           → Curated article list
  articles/[id]/page.tsx      → Article detail: read, summarize, listen
  api/bookmarks/route.ts      → GET: list bookmarks (paginated)
  api/bookmarks/refresh/      → POST: trigger Playwright fetch
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
  db.ts                       → Prisma singleton
  scraper.ts                  → @mozilla/readability + jsdom article scraper
  groq.ts                     → Groq streaming client
  playwright-fetcher.ts       → Twitter bookmark scraper

scripts/
  save-twitter-session.ts     → One-time: saves Twitter cookies to file
```

## Key Patterns

### Route Handler params (Next.js 16)
`params` is a **Promise** and must be awaited:
```ts
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### Streaming Groq response
The `/api/summarize` route returns a `ReadableStream` of text chunks.
The client reads it chunk-by-chunk and appends to state.

### TanStack Query keys
- `['bookmarks', page]` — paginated bookmark list
- `['articles', page]` — paginated article list
- `['article', id]` — single article detail

### Prisma model notes
- `Bookmark.urls` and `Bookmark.mediaUrls` are stored as JSON arrays
- Deleting from article list sets `addedToList = false` (soft delete)
- Cascade delete: deleting a bookmark also deletes its linked article

## Twitter Session Management

1. Run `npm run save-twitter-session` — browser opens
2. Log into Twitter, press Enter in terminal
3. Cookies saved to `twitter-cookies.json` (gitignored)
4. Session typically lasts 30–60 days
5. If Playwright fetch fails with auth errors, re-run the save script

## Database Commands

```bash
npm run db:push     # Apply schema changes without migration history
npm run db:migrate  # Create and apply a new migration (use for production)
npm run db:studio   # Open Prisma Studio visual DB browser
npm run db:generate # Regenerate Prisma client after schema changes
```

## Groq Model

Currently using `llama-3.1-8b-instant` for fast, free responses.
To switch models, edit `lib/groq.ts`. Available free models:
- `llama-3.1-8b-instant` — fastest
- `llama-3.3-70b-versatile` — higher quality, slower
- `mixtral-8x7b-32768` — large context window
