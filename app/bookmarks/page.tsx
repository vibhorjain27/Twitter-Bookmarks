'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { NavBar } from '@/components/NavBar'
import { BookmarkCard } from '@/components/BookmarkCard'
import { UploadModal } from '@/components/UploadModal'
import { Button } from '@/components/ui/button'

interface BookmarksResponse {
  bookmarks: Bookmark[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
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
  article: { id: string; addedToList: boolean; title: string | null } | null
}

export default function BookmarksPage() {
  const [page, setPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const { data, isLoading, refetch } = useQuery<BookmarksResponse>({
    queryKey: ['bookmarks', page],
    queryFn: async () => {
      const res = await fetch(`/api/bookmarks?page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to load bookmarks')
      return res.json()
    },
  })

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/bookmarks/refresh', { method: 'POST' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      toast.success(result.message)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Refresh failed')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Twitter Bookmarks</h1>
            {data && (
              <p className="text-sm text-slate-500 mt-1">{data.pagination.total} bookmarks total</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload JSON
            </Button>
            <Button size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Fetching...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-36 bg-white rounded-lg border animate-pulse" />
            ))}
          </div>
        ) : data?.bookmarks.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium">No bookmarks yet</p>
            <p className="text-sm mt-2">
              Click <strong>Refresh</strong> to fetch your Twitter bookmarks automatically,
              or <strong>Upload JSON</strong> to import them manually.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.bookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
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

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  )
}
