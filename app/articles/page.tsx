'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Headphones,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { NavBar } from '@/components/NavBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Article {
  id: string
  url: string
  title: string | null
  articleAuthor: string | null
  wordCount: number | null
  scrapedAt: string | null
  summary: string | null
  addedAt: string
  bookmark: {
    tweetText: string
    authorUsername: string
    authorName: string
  }
}

interface ArticlesResponse {
  articles: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ArticlesPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<ArticlesResponse>({
    queryKey: ['articles', page],
    queryFn: async () => {
      const res = await fetch(`/api/articles?page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to load articles')
      return res.json()
    },
  })

  const removeArticle = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove article')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Removed from Article List')
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
    onError: () => toast.error('Failed to remove article'),
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Article List</h1>
            {data && (
              <p className="text-sm text-slate-500 mt-1">{data.pagination.total} articles saved</p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-lg border animate-pulse" />
            ))}
          </div>
        ) : data?.articles.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No articles yet</p>
            <p className="text-sm mt-2">
              Go to{' '}
              <Link href="/bookmarks" className="text-blue-600 hover:underline">
                Bookmarks
              </Link>{' '}
              and add some to your Article List.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.articles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                onRemove={() => removeArticle.mutate(article.id)}
                isRemoving={removeArticle.isPending}
              />
            ))}
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600">
              Page {page} of {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data.pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

function ArticleRow({
  article,
  onRemove,
  isRemoving,
}: {
  article: Article
  onRemove: () => void
  isRemoving: boolean
}) {
  const displayTitle =
    article.title ?? article.bookmark.tweetText.slice(0, 80) + '...'
  const domain = getDomain(article.url)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-medium text-slate-900 line-clamp-2">{displayTitle}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              {article.articleAuthor && <span>By {article.articleAuthor}</span>}
              {domain && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  <ExternalLink className="h-3 w-3" />
                  {domain}
                </a>
              )}
              {article.wordCount && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {article.wordCount.toLocaleString()} words
                </span>
              )}
              {article.scrapedAt ? (
                <Badge variant="secondary" className="text-xs py-0">Scraped</Badge>
              ) : (
                <Badge variant="outline" className="text-xs py-0 text-amber-600 border-amber-200">
                  Not scraped
                </Badge>
              )}
              {article.summary && (
                <Badge variant="secondary" className="text-xs py-0 bg-green-50 text-green-700">
                  Has summary
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <Link href={`/articles/${article.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <BookOpen className="h-3 w-3 mr-2" />
              Read
            </Button>
          </Link>
          <Link href={`/articles/${article.id}?listen=true`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Headphones className="h-3 w-3 mr-2" />
              Listen
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            disabled={isRemoving}
            className="text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return null
  }
}
