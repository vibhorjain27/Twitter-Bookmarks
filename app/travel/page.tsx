'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { TravelNavBar } from '@/components/TravelNavBar'
import { PostcardCard, TravelPostSummary } from '@/components/PostcardCard'
import { Plus, Loader2, Globe, ChevronLeft, ChevronRight } from 'lucide-react'

const WorldMap = dynamic(() => import('@/components/WorldMap').then((m) => m.WorldMap), { ssr: false })

const CONTINENTS: Record<string, string[]> = {
  Europe: ['France', 'Italy', 'Spain', 'Germany', 'United Kingdom', 'Greece', 'Portugal', 'Netherlands', 'Switzerland', 'Austria', 'Czech Republic', 'Poland', 'Hungary', 'Croatia', 'Norway', 'Sweden', 'Denmark', 'Finland', 'Iceland', 'Belgium', 'Ireland'],
  Asia: ['Japan', 'Thailand', 'India', 'China', 'South Korea', 'Vietnam', 'Singapore', 'Malaysia', 'Nepal', 'Indonesia', 'Philippines', 'Cambodia', 'Sri Lanka', 'Bhutan', 'Maldives', 'Myanmar', 'Laos', 'Bangladesh', 'Pakistan'],
  Americas: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Peru', 'Colombia', 'Chile', 'Cuba', 'Costa Rica', 'Ecuador', 'Bolivia', 'Uruguay', 'Panama', 'Guatemala'],
  Africa: ['Morocco', 'Egypt', 'South Africa', 'Kenya', 'Tanzania', 'Ethiopia', 'Tunisia', 'Ghana', 'Nigeria', 'Senegal', 'Zimbabwe', 'Botswana', 'Namibia'],
  Oceania: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa', 'Vanuatu'],
  'Middle East': ['Turkey', 'Israel', 'United Arab Emirates', 'Jordan', 'Oman', 'Qatar', 'Lebanon', 'Bahrain'],
}

const FILTER_TABS = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East']

interface ApiResponse {
  posts: TravelPostSummary[]
  total: number
  page: number
  pages: number
}

export default function TravelPage() {
  const [posts, setPosts] = useState<TravelPostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  async function fetchPosts(p = 1, country?: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (country) params.set('country', country)
      const res = await fetch(`/api/travel?${params}`)
      const data: ApiResponse = await res.json()
      setPosts(data.posts)
      setTotal(data.total)
      setTotalPages(data.pages)
      setPage(data.page)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(1, selectedCountry ?? undefined)
  }, [selectedCountry])

  function handleTabChange(tab: string) {
    setActiveTab(tab)
    setSelectedCountry(null)
    fetchPosts(1)
  }

  function handleCountryClick(geoName: string) {
    setSelectedCountry((prev) => (prev === geoName ? null : geoName))
    setActiveTab('All')
  }

  const visitedCountries = [...new Set(posts.map((p) => p.country))]

  const displayedPosts =
    activeTab === 'All' || selectedCountry
      ? posts
      : posts.filter((p) => CONTINENTS[activeTab]?.includes(p.country))

  return (
    <div className="min-h-screen bg-[#fdf8f3]" style={{ fontFamily: "'Lato', system-ui, sans-serif" }}>
      <TravelNavBar />

      <div className="pt-16">
        {/* World Map section */}
        <section className="bg-gradient-to-b from-[#0f2942] to-[#1a3f6f] pb-8 pt-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Explore the World
                </h1>
                <p className="text-white/60 text-sm mt-1">
                  {total} {total === 1 ? 'story' : 'stories'} from around the globe · click a highlighted country to filter
                </p>
              </div>
              <Link
                href="/travel/new"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-400 transition-all shadow-lg"
              >
                <Plus className="h-4 w-4" /> Add Story
              </Link>
            </div>

            <WorldMap
              visitedCountries={visitedCountries}
              onCountryClick={handleCountryClick}
              selectedCountry={selectedCountry}
              height={340}
            />

            {selectedCountry && (
              <div className="mt-3 flex items-center gap-2">
                <span className="bg-amber-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  📍 {selectedCountry}
                </span>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  Clear filter ✕
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Filter tabs */}
        <section className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab && !selectedCountry
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  {tab === 'All' ? `🌍 ${tab}` : tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Postcard grid */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🗺️</div>
              <h3
                className="text-2xl font-bold text-slate-700 mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                No stories here yet
              </h3>
              <p className="text-slate-500 mb-8">Be the first to share an adventure from this destination!</p>
              <Link
                href="/travel/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-600 transition-all"
              >
                <Plus className="h-4 w-4" />
                Share Your Story
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedPosts.map((post) => (
                  <PostcardCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() => fetchPosts(page - 1, selectedCountry ?? undefined)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchPosts(page + 1, selectedCountry ?? undefined)}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* FAB - mobile */}
      <Link
        href="/travel/new"
        className="fixed bottom-6 right-6 sm:hidden z-50 w-14 h-14 bg-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-amber-600 transition-all hover:scale-110 animate-pulse-glow"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  )
}
