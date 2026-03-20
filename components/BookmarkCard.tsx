'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Check, ExternalLink, User } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface BookmarkArticle {
  id: string
  addedToList: boolean
  title: string | null
}

interface Bookmark {
  id: string
  tweetId: string
  tweetText: string
  authorUsername: string
  authorName: string
  tweetCreatedAt: string
  bookmarkedAt: string
  urls: string[]
  mediaUrls: string[]
  source: string
  article: BookmarkArticle | null
}

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const queryClient = useQueryClient()
  const isInList = bookmark.article?.addedToList === true

  const addToList = useMutation({
    mutationFn: async () => {
      const primaryUrl = (bookmark.urls as string[])[0] ?? `https://twitter.com/i/web/status/${bookmark.tweetId}`
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarkId: bookmark.id, url: primaryUrl }),
      })
      if (!res.ok) throw new Error('Failed to add to article list')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Added to Article List')
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
    onError: () => toast.error('Failed to add to list'),
  })

  const removeFromList = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/articles/${bookmark.article?.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove from article list')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Removed from Article List')
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
    onError: () => toast.error('Failed to remove from list'),
  })

  const primaryUrl = (bookmark.urls as string[])[0]
  const tweetUrl = `https://twitter.com/i/web/status/${bookmark.tweetId}`
  const timeAgo = formatTimeAgo(new Date(bookmark.bookmarkedAt))

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <User className="h-3 w-3" />
            <span className="font-medium text-slate-700">@{bookmark.authorUsername}</span>
            <span>·</span>
            <span>{timeAgo}</span>
            {bookmark.source === 'playwright' && (
              <Badge variant="secondary" className="text-xs py-0">auto</Badge>
            )}
          </div>
        </div>

        <p className="text-slate-800 text-sm leading-relaxed mb-3 line-clamp-4">
          {bookmark.tweetText}
        </p>

        {primaryUrl && (
          <a
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-3 truncate"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{primaryUrl.replace(/^https?:\/\//, '')}</span>
          </a>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            View tweet
          </a>

          {isInList ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeFromList.mutate()}
              disabled={removeFromList.isPending}
              className="text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <Check className="h-3 w-3 mr-1" />
              In Article List
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => addToList.mutate()}
              disabled={addToList.isPending || !primaryUrl}
              title={!primaryUrl ? 'No URL found in this bookmark' : undefined}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add to Article List
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
