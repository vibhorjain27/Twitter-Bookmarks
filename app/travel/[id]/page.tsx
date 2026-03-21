'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { TravelNavBar } from '@/components/TravelNavBar'
import { Heart, MapPin, Calendar, User, Tag, ArrowLeft, Share2, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface TravelPost {
  id: string
  title: string
  location: string
  country: string
  imageUrl: string | null
  content: string
  authorName: string
  tags: string[]
  likes: number
  createdAt: string
  updatedAt: string
}

export default function TravelPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [post, setPost] = useState<TravelPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/travel/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { router.push('/travel'); return }
        setPost(data)
        setLikeCount(data.likes)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleLike() {
    if (liked || !post) return
    setLiked(true)
    setLikeCount((c) => c + 1)
    await fetch(`/api/travel/${post.id}/like`, { method: 'POST' })
    toast.success('Thanks for the love! ❤️')
  }

  async function handleDelete() {
    if (!confirm('Delete this postcard? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/travel/${id}`, { method: 'DELETE' })
    toast.success('Postcard deleted')
    router.push('/travel')
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: post?.title ?? 'Mapping Postcard', url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f3] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!post) return null

  const imageUrl = post.imageUrl || `https://picsum.photos/seed/${post.id}/1200/600`
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const tags: string[] = Array.isArray(post.tags) ? post.tags : []

  return (
    <div className="min-h-screen bg-[#fdf8f3]" style={{ fontFamily: "'Lato', system-ui, sans-serif" }}>
      <TravelNavBar />

      {/* Hero image */}
      <div className="relative h-[55vh] min-h-[360px] overflow-hidden bg-slate-800 pt-16">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <Link
          href="/travel"
          className="absolute top-20 left-4 md:left-8 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/30 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Explore
        </Link>

        {/* Stamp */}
        <div
          className="absolute top-20 right-4 md:right-8 w-16 h-16 bg-white border-2 border-slate-300 flex flex-col items-center justify-center shadow-lg"
          style={{ transform: 'rotate(-4deg)', boxShadow: 'inset 0 0 0 3px white, 0 4px 12px rgba(0,0,0,0.3)' }}
        >
          <span className="text-2xl">✈️</span>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Postcard</span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {post.country}
            </span>
          </div>
          <h1
            className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-3xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          >
            {post.title}
          </h1>
        </div>
      </div>

      {/* Airmail stripe */}
      <div className="postcard-stripe" />

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-dashed border-slate-200">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-slate-700">{post.location}, {post.country}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-amber-500" />
            <span>{post.authorName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-amber-500" />
            <span>{date}</span>
          </div>
        </div>

        {/* Story content */}
        <article
          className="text-slate-700 text-lg leading-relaxed space-y-4 mb-10"
        >
          {post.content.split('\n').filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-10">
            <Tag className="h-4 w-4 text-slate-400" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm border border-amber-200 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all duration-200 ${
              liked
                ? 'bg-red-500 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-500 hover:scale-105'
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-500 hover:scale-105 transition-all"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>

          <div className="flex-1" />

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </button>
        </div>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href="/travel"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-700 transition-all hover:gap-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore More Stories
          </Link>
        </div>
      </div>
    </div>
  )
}
