import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export interface ScrapedArticle {
  title: string | null
  author: string | null
  content: string | null
  textContent: string | null
  excerpt: string | null
  publishedTime: string | null
  wordCount: number
}

export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const dom = new JSDOM(html, { url })
  const reader = new Readability(dom.window.document)
  const article = reader.parse()

  if (!article) {
    // Fallback: extract body text
    const body = dom.window.document.body
    const text = body ? body.textContent?.replace(/\s+/g, ' ').trim() ?? '' : ''
    return {
      title: dom.window.document.title || null,
      author: null,
      content: text,
      textContent: text,
      excerpt: text.slice(0, 300),
      publishedTime: null,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    }
  }

  const wordCount = article.textContent
    ? article.textContent.split(/\s+/).filter(Boolean).length
    : 0

  return {
    title: article.title || null,
    author: article.byline || null,
    content: article.content || null,
    textContent: article.textContent || null,
    excerpt: article.excerpt || null,
    publishedTime: article.publishedTime || null,
    wordCount,
  }
}
