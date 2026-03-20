'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Upload, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
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
  const [showUpload, setShowUpload] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const { data, isLoading } = useQuery<BookmarksResponse>({
    queryKey: ['bookmarks', page],
    queryFn: async () => {
      const res = await fetch(`/api/bookmarks?page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to load bookmarks')
      return res.json()
    },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Twitter Bookmarks</h1>
            {data && (
              <p className="text-sm text-slate-500 mt-1">{data.pagination.total} bookmarks imported</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHelp(!showHelp)}>
              <HelpCircle className="h-4 w-4 mr-2" />
              How to import
            </Button>
            <Button size="sm" onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Bookmarks
            </Button>
          </div>
        </div>

        {/* How-to panel */}
        {showHelp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6 text-sm text-blue-900 space-y-3">
            <p className="font-semibold text-base">How to import your Twitter bookmarks</p>
            <p>
              Install the free Chrome extension{' '}
              <a
                href="https://chromewebstore.google.com/detail/bookmark-exporter-for-x-t/apfgpkkhhglnbmklplpklfhfmncmaaib"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Bookmark Exporter for X/Twitter
              </a>{' '}
              (or search the Chrome Web Store for "Twitter bookmark export").
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Install the extension in Chrome</li>
              <li>Go to <strong>twitter.com/i/bookmarks</strong> while logged in</li>
              <li>Click the extension icon and export as JSON</li>
              <li>Come back here and click <strong>Import Bookmarks</strong></li>
              <li>Drop the downloaded JSON file into the upload area</li>
            </ol>
            <p className="text-xs text-blue-700">
              Re-run this whenever you add new bookmarks on Twitter. Your existing article list is preserved.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-36 bg-white rounded-lg border animate-pulse" />
            ))}
          </div>
        ) : data?.bookmarks.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-4">
            <Upload className="h-12 w-12 mx-auto opacity-20" />
            <p className="text-lg font-medium">No bookmarks yet</p>
            <p className="text-sm max-w-sm mx-auto">
              Click <strong>How to import</strong> above for step-by-step instructions,
              then use <strong>Import Bookmarks</strong> to upload your JSON file.
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Bookmarks
            </Button>
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
