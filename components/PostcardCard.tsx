'use client'

import Link from 'next/link'
import { Heart, MapPin, Calendar, User } from 'lucide-react'
import { useState } from 'react'

export interface TravelPostSummary {
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
}

export function PostcardCard({ post }: { post: TravelPostSummary }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const imageUrl = post.imageUrl || `https://picsum.photos/seed/${post.id}/800/500`
  const excerpt = post.content.slice(0, 110) + (post.content.length > 110 ? '…' : '')
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const tags: string[] = Array.isArray(post.tags) ? post.tags : []

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    if (liked) return
    setLiked(true)
    setLikeCount((c) => c + 1)
    await fetch(`/api/travel/${post.id}/like`, { method: 'POST' })
  }

  return (
    <Link href={`/travel/${post.id}`} className="block group">
      <article
        className="relative bg-white overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl rounded-sm postcard-frame"
      >
        {/* Airmail stripe at top */}
        <div className="postcard-stripe" />

        {/* Postage stamp */}
        <div
          className="absolute top-6 right-3 z-10 w-[52px] h-[56px] bg-white border-2 border-slate-300 flex flex-col items-center justify-center shadow-sm select-none"
          style={{ transform: 'rotate(-2deg)', boxShadow: 'inset 0 0 0 3px white, 0 2px 4px rgba(0,0,0,0.15)' }}
        >
          <span className="text-xl leading-none">✈️</span>
          <span className="text-[7px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">Postcard</span>
          <span className="text-[6px] text-slate-400">♦♦♦♦♦</span>
        </div>

        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-amber-50">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {/* Location badge over image */}
          <div className="absolute bottom-2 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-amber-700 uppercase tracking-wider px-2 py-1 rounded-full">
            <MapPin className="h-2.5 w-2.5" />
            {post.location}
          </div>
        </div>

        {/* Divider – red+blue postal stripes */}
        <div className="flex h-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-red-600' : 'bg-blue-700'}`} />
          ))}
        </div>

        {/* Content area */}
        <div className="p-4 pt-3">
          {/* Country badge */}
          <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-widest">
            {post.country}
          </span>

          <h3
            className="font-bold text-slate-800 text-[17px] leading-snug mt-1 mb-2 line-clamp-2 font-playfair"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {post.title}
          </h3>

          <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {excerpt}
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-dashed border-slate-200 pt-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="font-medium text-slate-600">{post.authorName}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {date}
              </div>
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-all duration-200 hover:scale-110 ${
                liked ? 'text-red-500 scale-110' : 'text-slate-400 hover:text-red-400'
              }`}
              aria-label="Like this post"
            >
              <Heart className={`h-3.5 w-3.5 transition-all ${liked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likeCount}</span>
            </button>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
