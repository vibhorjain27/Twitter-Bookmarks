import { prisma } from '@/lib/db'
import { streamSummary } from '@/lib/groq'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { articleId } = await request.json()

  if (!articleId) {
    return Response.json({ error: 'articleId is required' }, { status: 400 })
  }

  const article = await prisma.article.findUnique({ where: { id: articleId } })

  if (!article) {
    return Response.json({ error: 'Article not found' }, { status: 404 })
  }

  if (!article.scrapedContent) {
    return Response.json({ error: 'Article has not been scraped yet. Scrape it first.' }, { status: 400 })
  }

  // Stream the response back to the client
  const encoder = new TextEncoder()
  let fullSummary = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamSummary(article.scrapedContent!, (chunk) => {
          fullSummary += chunk
          controller.enqueue(encoder.encode(chunk))
        })

        // Save the full summary to the database
        await prisma.article.update({
          where: { id: articleId },
          data: { summary: fullSummary },
        })

        controller.close()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Summarization failed'
        controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
