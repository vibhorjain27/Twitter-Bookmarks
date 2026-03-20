import { chromium, type Browser, type BrowserContext } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import { prisma } from './db'

const COOKIES_PATH = process.env.TWITTER_COOKIES_PATH ?? './twitter-cookies.json'

export interface TwitterBookmark {
  tweetId: string
  tweetText: string
  authorUsername: string
  authorName: string
  tweetCreatedAt: Date
  urls: string[]
  mediaUrls: string[]
}

export async function saveTwitterSession(): Promise<void> {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('Opening Twitter login page...')
  await page.goto('https://twitter.com/login')

  console.log('Please log in to Twitter manually. Press Enter in this terminal when done.')
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve())
  })

  const cookies = await context.cookies()
  const storageState = await context.storageState()

  const sessionData = { cookies, storageState }
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(sessionData, null, 2))
  console.log(`Session saved to ${COOKIES_PATH}`)

  await browser.close()
}

async function loadSession(context: BrowserContext): Promise<void> {
  const absolutePath = path.resolve(COOKIES_PATH)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Twitter session file not found at ${absolutePath}. Run "npm run save-twitter-session" first.`
    )
  }

  const sessionData = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'))
  await context.addCookies(sessionData.cookies)
}

function extractBookmarksFromResponse(data: unknown): TwitterBookmark[] {
  const bookmarks: TwitterBookmark[] = []

  function processEntry(entry: unknown): void {
    if (!entry || typeof entry !== 'object') return
    const e = entry as Record<string, unknown>

    // Navigate Twitter's GraphQL response structure
    const content = e.content as Record<string, unknown> | undefined
    if (!content) return

    const itemContent = content.itemContent as Record<string, unknown> | undefined
    if (!itemContent || itemContent.itemType !== 'TimelineTweet') return

    const tweetResult = itemContent.tweet_results as Record<string, unknown> | undefined
    if (!tweetResult?.result) return

    const tweet = tweetResult.result as Record<string, unknown>
    const core = tweet.core as Record<string, unknown> | undefined
    const legacy = tweet.legacy as Record<string, unknown> | undefined
    if (!legacy) return

    const userResults = core?.user_results as Record<string, unknown> | undefined
    const userLegacy = (userResults?.result as Record<string, unknown>)?.legacy as
      | Record<string, unknown>
      | undefined

    const tweetId = (legacy.id_str as string) || ''
    const tweetText = (legacy.full_text as string) || ''
    const authorUsername = (userLegacy?.screen_name as string) || ''
    const authorName = (userLegacy?.name as string) || ''
    const createdAt = legacy.created_at ? new Date(legacy.created_at as string) : new Date()

    // Extract URLs from entities
    const entities = legacy.entities as Record<string, unknown> | undefined
    const urlEntities = (entities?.urls as Array<Record<string, unknown>>) || []
    const urls = urlEntities.map((u) => (u.expanded_url as string) || (u.url as string)).filter(Boolean)

    // Extract media URLs
    const extEntities = legacy.extended_entities as Record<string, unknown> | undefined
    const media = (extEntities?.media as Array<Record<string, unknown>>) || []
    const mediaUrls = media.map((m) => (m.media_url_https as string) || '').filter(Boolean)

    if (tweetId && tweetText) {
      bookmarks.push({
        tweetId,
        tweetText,
        authorUsername,
        authorName,
        tweetCreatedAt: createdAt,
        urls,
        mediaUrls,
      })
    }
  }

  function walk(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj)) {
      obj.forEach(walk)
    } else {
      const o = obj as Record<string, unknown>
      if (o.itemType === 'TimelineTweet') {
        processEntry({ content: { itemContent: obj } })
      }
      Object.values(o).forEach(walk)
    }
  }

  walk(data)
  return bookmarks
}

export async function fetchTwitterBookmarks(): Promise<{ fetched: number; new: number }> {
  let browser: Browser | null = null

  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    await loadSession(context)

    const collectedBookmarks: TwitterBookmark[] = []

    // Intercept the GraphQL API calls Twitter makes when loading bookmarks
    context.on('response', async (response) => {
      const url = response.url()
      if (url.includes('Bookmarks') && url.includes('graphql')) {
        try {
          const json = await response.json()
          const found = extractBookmarksFromResponse(json)
          collectedBookmarks.push(...found)
        } catch {
          // Response might not be JSON, ignore
        }
      }
    })

    const page = await context.newPage()
    await page.goto('https://twitter.com/i/bookmarks', { waitUntil: 'networkidle', timeout: 30000 })

    // Scroll to load more bookmarks
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3))
      await page.waitForTimeout(2000)
    }

    await browser.close()
    browser = null

    if (collectedBookmarks.length === 0) {
      return { fetched: 0, new: 0 }
    }

    // Upsert all bookmarks to database
    let newCount = 0
    for (const bm of collectedBookmarks) {
      const result = await prisma.bookmark.upsert({
        where: { tweetId: bm.tweetId },
        create: {
          tweetId: bm.tweetId,
          tweetText: bm.tweetText,
          authorUsername: bm.authorUsername,
          authorName: bm.authorName,
          tweetCreatedAt: bm.tweetCreatedAt,
          urls: bm.urls,
          mediaUrls: bm.mediaUrls,
          source: 'playwright',
          fetchedAt: new Date(),
        },
        update: {
          fetchedAt: new Date(),
          source: 'playwright',
        },
      })

      // Count as new if it was just created (fetchedAt matches now closely)
      const isNew = Math.abs(result.fetchedAt.getTime() - new Date().getTime()) < 5000
      if (isNew) newCount++
    }

    return { fetched: collectedBookmarks.length, new: newCount }
  } finally {
    if (browser) await browser.close()
  }
}
