'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ExternalLink,
  ScanText,
  FileText,
  Clock,
  Calendar,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { NavBar } from '@/components/NavBar'
import { SummaryPanel } from '@/components/SummaryPanel'
import { AudioPlayer } from '@/components/AudioPlayer'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface Article {
  id: string
  url: string
  title: string | null
  scrapedContent: string | null
  summary: string | null
  wordCount: number | null
  articleAuthor: string | null
  publishedAt: string | null
  scrapedAt: string | null
  addedToList: boolean
  addedAt: string
  bookmark: {
    tweetId: string
    tweetText: string
    authorUsername: string
    authorName: string
  }
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const [summary, setSummary] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery<{ article: Article }>({
    queryKey: ['article', id],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${id}`)
      if (!res.ok) throw new Error('Article not found')
      return res.json()
    },
  })

  const scrape = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/articles/${id}/scrape`, { method: 'POST' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Scraping failed')
      return result
    },
    onSuccess: (result) => {
      toast.success(`Scraped successfully — ${result.wordCount?.toLocaleString()} words`)
      queryClient.invalidateQueries({ queryKey: ['article', id] })
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Scraping failed'),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3" />
            <div className="h-96 bg-white rounded-lg border animate-pulse" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !data?.article) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-red-600">Article not found.</p>
          <Link href="/articles" className="text-blue-600 hover:underline text-sm mt-2 block">
            ← Back to Article List
          </Link>
        </main>
      </div>
    )
  }

  const article = data.article
  const currentSummary = summary ?? article.summary
  const domain = getDomain(article.url)
  const readingTime = article.wordCount ? Math.ceil(article.wordCount / 200) : null

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/articles"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Article List
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-3">
            {article.title ?? article.bookmark.tweetText.slice(0, 100)}
          </h1>

          <div className="flex items-center gap-3 flex-wrap text-sm text-slate-500">
            {article.articleAuthor && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {article.articleAuthor}
              </span>
            )}
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            )}
            {readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{readingTime} min read
              </span>
            )}
            {domain && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {domain}
              </a>
            )}
          </div>
        </div>

        {/* Scrape button if not yet scraped */}
        {!article.scrapedAt && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800">Article not yet scraped</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Scrape the article to read the full content and generate an AI summary.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => scrape.mutate()}
              disabled={scrape.isPending}
              className="ml-4 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <ScanText className="h-3 w-3 mr-2" />
              {scrape.isPending ? 'Scraping...' : 'Scrape Article'}
            </Button>
          </div>
        )}

        {/* Main content tabs */}
        <Tabs defaultValue="summary">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="summary" className="flex-1">
              <FileText className="h-3 w-3 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="full" className="flex-1" disabled={!article.scrapedContent}>
              <FileText className="h-3 w-3 mr-2" />
              Full Article
              {article.wordCount && (
                <Badge variant="secondary" className="ml-2 text-xs py-0">
                  {article.wordCount.toLocaleString()}w
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {article.scrapedAt ? (
              <SummaryPanel
                articleId={article.id}
                existingSummary={article.summary}
                onSummaryGenerated={(s) => setSummary(s)}
              />
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p className="text-sm">Scrape the article first to generate a summary.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="full" className="space-y-4">
            {article.scrapedContent ? (
              <>
                <AudioPlayer text={article.scrapedContent} label="Full Article" />
                <div className="prose prose-sm max-w-none bg-white border rounded-lg p-6">
                  <div className="whitespace-pre-wrap text-slate-800 leading-relaxed text-sm">
                    {article.scrapedContent}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p className="text-sm">No content available. Scrape the article first.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Source tweet */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400 font-medium mb-2">SOURCE TWEET</p>
          <div className="bg-white border rounded-lg p-3">
            <p className="text-sm text-slate-700">{article.bookmark.tweetText}</p>
            <a
              href={`https://twitter.com/i/web/status/${article.bookmark.tweetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 block"
            >
              @{article.bookmark.authorUsername} — View on Twitter
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return null
  }
}
