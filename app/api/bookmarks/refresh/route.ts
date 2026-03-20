import { fetchTwitterBookmarks } from '@/lib/playwright-fetcher'

export async function POST() {
  try {
    const result = await fetchTwitterBookmarks()
    return Response.json({
      success: true,
      fetched: result.fetched,
      new: result.new,
      message: `Fetched ${result.fetched} bookmarks (${result.new} new)`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
