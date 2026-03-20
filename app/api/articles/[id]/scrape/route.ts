import { prisma } from '@/lib/db'
import { scrapeArticle } from '@/lib/scraper'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let article
  try {
    article = await prisma.article.findUnique({ where: { id } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return Response.json({ error: message }, { status: 500 })
  }

  if (!article) {
    return Response.json({ error: 'Article not found' }, { status: 404 })
  }

  // x.com / twitter.com links cannot be scraped (login wall)
  try {
    const host = new URL(article.url).hostname.replace('www.', '')
    if (host === 'x.com' || host === 'twitter.com' || host === 't.co') {
      return Response.json(
        { error: 'Twitter/X links cannot be scraped — the content is behind a login wall. Open the link and copy the article URL instead.' },
        { status: 422 }
      )
    }
  } catch {
    // invalid URL — let scraper handle it
  }

  try {
    const scraped = await scrapeArticle(article.url)

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: scraped.title ?? article.title,
        scrapedContent: scraped.textContent,
        articleAuthor: scraped.author,
        wordCount: scraped.wordCount,
        publishedAt: scraped.publishedTime ? new Date(scraped.publishedTime) : null,
        scrapedAt: new Date(),
      },
    })

    return Response.json({
      success: true,
      article: updated,
      wordCount: scraped.wordCount,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scraping failed'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
