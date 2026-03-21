'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TravelNavBar } from '@/components/TravelNavBar'
import { MapPin, User, Image as ImageIcon, Tag, FileText, Globe, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belgium','Bhutan','Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria',
  'Cambodia','Canada','Chile','China','Colombia','Costa Rica','Croatia','Cuba','Czech Republic',
  'Denmark','Ecuador','Egypt','Estonia','Ethiopia',
  'Finland','France',
  'Georgia','Germany','Ghana','Greece','Guatemala',
  'Hungary',
  'Iceland','India','Indonesia','Iran','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kuwait',
  'Laos','Latvia','Lebanon','Lithuania',
  'Malaysia','Maldives','Malta','Mexico','Mongolia','Morocco','Myanmar',
  'Nepal','Netherlands','New Zealand','Nigeria','Norway',
  'Oman',
  'Pakistan','Panama','Peru','Philippines','Poland','Portugal',
  'Qatar',
  'Romania','Russia',
  'Saudi Arabia','Senegal','Serbia','Singapore','Slovakia','Slovenia','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland','Syria',
  'Taiwan','Tanzania','Thailand','Tunisia','Turkey',
  'Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam',
  'Yemen',
  'Zimbabwe',
].sort()

interface FormData {
  title: string
  authorName: string
  country: string
  location: string
  imageUrl: string
  content: string
  tags: string
}

export default function NewTravelPost() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormData>({
    title: '',
    authorName: '',
    country: '',
    location: '',
    imageUrl: '',
    content: '',
    tags: '',
  })

  function update(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const previewImage = form.imageUrl || `https://picsum.photos/seed/${form.country || 'travel'}/600/400`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.location.trim() || !form.country || !form.content.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const tagsArray = form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)

      const res = await fetch('/api/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tags: tagsArray }),
      })

      if (!res.ok) throw new Error('Failed to create post')
      const post = await res.json()
      toast.success('Your postcard has been shared! ✈️')
      router.push(`/travel/${post.id}`)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdf8f3]" style={{ fontFamily: "'Lato', system-ui, sans-serif" }}>
      <TravelNavBar />

      <div className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/travel"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Explore
            </Link>
            <h1
              className="text-4xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Share Your Postcard
            </h1>
            <p className="text-slate-500 mt-2">Tell the world about your adventure</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ── Left: Form ──────────────────────────── */}
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <FileText className="h-4 w-4 inline mr-1.5 text-amber-500" />
                    Story Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="e.g. Sunrise Over the Eiffel Tower"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-lg font-medium"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    required
                  />
                </div>

                {/* Author + Country row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      <User className="h-4 w-4 inline mr-1.5 text-amber-500" />
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={form.authorName}
                      onChange={(e) => update('authorName', e.target.value)}
                      placeholder="e.g. Emma T."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      <Globe className="h-4 w-4 inline mr-1.5 text-amber-500" />
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.country}
                      onChange={(e) => update('country', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select country…</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <MapPin className="h-4 w-4 inline mr-1.5 text-amber-500" />
                    Specific Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="e.g. Paris, Eiffel Tower, Champ de Mars"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <ImageIcon className="h-4 w-4 inline mr-1.5 text-amber-500" />
                    Photo URL{' '}
                    <span className="text-slate-400 font-normal text-xs">(paste any public image link)</span>
                  </label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => update('imageUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Tip: right-click any web photo → "Copy image address"
                  </p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <FileText className="h-4 w-4 inline mr-1.5 text-amber-500" />
                    Your Story <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => update('content', e.target.value)}
                    placeholder="Describe your adventure… What did you see? How did it feel? What surprised you most?"
                    rows={7}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none leading-relaxed"
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <Tag className="h-4 w-4 inline mr-1.5 text-amber-500" />
                    Tags{' '}
                    <span className="text-slate-400 font-normal text-xs">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => update('tags', e.target.value)}
                    placeholder="e.g. beach, solo-travel, food, photography"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] transition-all duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Posting your adventure…
                    </>
                  ) : (
                    <>✈️ Send Postcard to the World</>
                  )}
                </button>
              </div>

              {/* ── Right: Live Preview ──────────────────── */}
              <div className="lg:sticky lg:top-24 h-fit">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Live Preview
                </p>

                {/* Postcard preview */}
                <div
                  className="bg-white rounded-sm postcard-frame overflow-hidden max-w-sm mx-auto"
                  style={{ transform: 'rotate(1deg)' }}
                >
                  <div className="postcard-stripe" />

                  {/* Stamp */}
                  <div className="relative">
                    <div className="absolute top-3 right-3 z-10 w-12 h-12 bg-white border-2 border-slate-300 flex flex-col items-center justify-center text-xl shadow-sm"
                      style={{ transform: 'rotate(-3deg)', boxShadow: 'inset 0 0 0 2px white, 0 2px 4px rgba(0,0,0,0.15)' }}>
                      ✈️
                    </div>
                    <div className="h-52 overflow-hidden bg-amber-50">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        key={previewImage}
                      />
                    </div>
                  </div>

                  <div className="flex h-1">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div key={j} className={`flex-1 ${j % 2 === 0 ? 'bg-red-600' : 'bg-blue-700'}`} />
                    ))}
                  </div>

                  <div className="p-5">
                    {(form.location || form.country) && (
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-1.5">
                        📍 {[form.location, form.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <h3
                      className="text-xl font-bold text-slate-800 leading-snug mb-2"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {form.title || 'Your Story Title'}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {form.content || 'Your adventure story will appear here…'}
                    </p>
                    <div className="mt-4 border-t border-dashed border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-medium text-slate-600">
                        {form.authorName || 'Anonymous Traveler'}
                      </span>
                      <span>❤️ 0</span>
                    </div>
                    {form.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {form.tags.split(',').slice(0, 3).map((t) => t.trim()).filter(Boolean).map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                            #{t.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                  This is how your postcard will look to other travellers
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
