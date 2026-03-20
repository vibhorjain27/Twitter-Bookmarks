import { prisma } from '@/lib/db'
import { scrapeArticle } from '@/lib/scraper'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) {
    return Response.json({ error: 'Article not found' }, { status: 404 })
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
