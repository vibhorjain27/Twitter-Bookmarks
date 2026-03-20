import { prisma } from '@/lib/db'

interface UploadedBookmark {
  tweetId?: string
  id?: string
  tweetText?: string
  full_text?: string
  text?: string
  authorUsername?: string
  author?: string
  screen_name?: string
  authorName?: string
  name?: string
  tweetCreatedAt?: string
  created_at?: string
  urls?: string[]
  mediaUrls?: string[]
  url?: string
}

function normalizeBookmark(raw: UploadedBookmark) {
  const tweetId = raw.tweetId ?? raw.id ?? ''
  const tweetText = raw.tweetText ?? raw.full_text ?? raw.text ?? ''
  const authorUsername = raw.authorUsername ?? raw.author ?? raw.screen_name ?? 'unknown'
  const authorName = raw.authorName ?? raw.name ?? authorUsername
  const tweetCreatedAt = raw.tweetCreatedAt ?? raw.created_at
  const urls = raw.urls ?? (raw.url ? [raw.url] : [])

  return {
    tweetId,
    tweetText,
    authorUsername,
    authorName,
    tweetCreatedAt: tweetCreatedAt ? new Date(tweetCreatedAt) : new Date(),
    urls,
    mediaUrls: raw.mediaUrls ?? [],
    source: 'manual_upload' as const,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Accept either an array directly or { bookmarks: [...] }
    const rawItems: UploadedBookmark[] = Array.isArray(body)
      ? body
      : Array.isArray(body.bookmarks)
        ? body.bookmarks
        : []

    if (rawItems.length === 0) {
      return Response.json({ success: false, error: 'No bookmarks found in payload' }, { status: 400 })
    }

    let imported = 0
    let skipped = 0

    for (const raw of rawItems) {
      const normalized = normalizeBookmark(raw)
      if (!normalized.tweetId || !normalized.tweetText) {
        skipped++
        continue
      }

      await prisma.bookmark.upsert({
        where: { tweetId: normalized.tweetId },
        create: normalized,
        update: { fetchedAt: new Date() },
      })
      imported++
    }

    return Response.json({
      success: true,
      imported,
      skipped,
      message: `Imported ${imported} bookmarks${skipped > 0 ? `, skipped ${skipped}` : ''}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
