import Link from 'next/link'
import { MapPin, ArrowRight, Globe, Heart, Camera } from 'lucide-react'

const SAMPLE_POSTS = [
  {
    id: 'sample-1',
    title: 'Sunrise Over the Eiffel Tower',
    location: 'Paris, France',
    imageUrl: 'https://picsum.photos/seed/paris-tower/600/400',
    authorName: 'Sophie L.',
  },
  {
    id: 'sample-2',
    title: 'Lost in the Cherry Blossom Forests',
    location: 'Kyoto, Japan',
    imageUrl: 'https://picsum.photos/seed/kyoto-sakura/600/400',
    authorName: 'James W.',
  },
  {
    id: 'sample-3',
    title: 'The Blue Domes of Santorini',
    location: 'Santorini, Greece',
    imageUrl: 'https://picsum.photos/seed/santorini-blue/600/400',
    authorName: 'Maria G.',
  },
]

const HOW_IT_WORKS = [
  {
    icon: '✍️',
    step: 1,
    title: 'Write Your Story',
    desc: 'Share the moments that took your breath away. No fancy equipment needed — just your words and a photo.',
  },
  {
    icon: '📍',
    step: 2,
    title: 'Pin Your Destination',
    desc: "Mark the countries you've explored. Watch your personal world map come alive with every new adventure.",
  },
  {
    icon: '🌍',
    step: 3,
    title: 'Inspire the World',
    desc: 'Your postcards reach fellow travellers everywhere. Spark the next great journey with your story.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ fontFamily: "'Lato', system-ui, sans-serif" }}>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f2942] via-[#1a3f6f] to-[#0d6b8a]">
        {/* Dotted background texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating paper airplane */}
        <div className="absolute top-24 left-0 text-4xl opacity-60 animate-plane pointer-events-none select-none">
          ✈️
        </div>

        {/* Floating postcards — desktop only */}
        <div className="hidden lg:block absolute left-10 top-1/2 -translate-y-1/2 animate-float-card pointer-events-none">
          <div
            className="w-52 h-36 bg-white rounded-sm shadow-2xl overflow-hidden postcard-frame opacity-80"
            style={{ transform: 'rotate(-8deg)' }}
          >
            <img src="https://picsum.photos/seed/hero-peru/400/250" alt="" className="w-full h-24 object-cover" />
            <div className="postcard-stripe" />
            <div className="px-3 py-1.5">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">📍 Machu Picchu, Peru</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 animate-float-card2 pointer-events-none">
          <div
            className="w-52 h-36 bg-white rounded-sm shadow-2xl overflow-hidden postcard-frame opacity-80"
            style={{ transform: 'rotate(7deg)' }}
          >
            <img src="https://picsum.photos/seed/hero-amalfi/400/250" alt="" className="w-full h-24 object-cover" />
            <div className="postcard-stripe" />
            <div className="px-3 py-1.5">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">📍 Amalfi Coast, Italy</p>
            </div>
          </div>
        </div>

        {/* Central content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white/90 text-sm font-medium px-5 py-2.5 rounded-full mb-8 animate-slide-up">
            <MapPin className="h-4 w-4 text-amber-400" />
            Share your world, one postcard at a time
          </div>

          {/* Main title */}
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-6 leading-none animate-slide-up delay-100"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              textShadow: '0 4px 32px rgba(0,0,0,0.4)',
            }}
          >
            Mapping
            <br />
            <span className="text-amber-400">Postcard</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed animate-slide-up delay-200">
            Your adventures, beautifully captured.
            <br />
            <span className="text-white/50 text-lg">Discover, share &amp; inspire fellow travellers.</span>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
            <Link
              href="/travel"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-full shadow-xl hover:from-amber-500 hover:to-orange-600 hover:scale-105 transition-all duration-200 animate-pulse-glow text-lg"
            >
              <Globe className="h-5 w-5" />
              Explore Stories
            </Link>
            <Link
              href="/travel/new"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white font-bold rounded-full hover:bg-white/20 hover:border-white/70 hover:scale-105 transition-all duration-200 text-lg"
            >
              <Camera className="h-5 w-5" />
              Share Your Story
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 animate-float-slow opacity-50">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full mx-auto flex items-start justify-center pt-1.5">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Stories ──────────────────────────── */}
      <section className="py-20 px-4 bg-[#fdf8f3]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-sm font-bold uppercase tracking-widest mb-3">Latest Adventures</p>
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-800"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Featured Postcards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SAMPLE_POSTS.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-sm postcard-frame overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="postcard-stripe" />
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Stamp */}
                  <div
                    className="absolute top-3 right-3 w-12 h-12 bg-white border-2 border-slate-300 flex flex-col items-center justify-center text-xl shadow-sm"
                    style={{ transform: 'rotate(-3deg)', boxShadow: 'inset 0 0 0 2px white, 0 2px 4px rgba(0,0,0,0.15)' }}
                  >
                    ✈️
                  </div>
                </div>
                <div className="flex h-1">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className={`flex-1 ${j % 2 === 0 ? 'bg-red-600' : 'bg-blue-700'}`} />
                  ))}
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-1">📍 {post.location}</p>
                  <h3
                    className="text-lg font-bold text-slate-800 leading-snug mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500">by {post.authorName}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/travel"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-700 transition-all hover:gap-3"
            >
              View All Stories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '195', label: 'Countries', icon: '🌍' },
              { value: '∞', label: 'Stories', icon: '📖' },
              { value: 'Free', label: 'Forever', icon: '❤️' },
            ].map(({ value, label, icon }) => (
              <div key={label}>
                <div className="text-4xl mb-2">{icon}</div>
                <div
                  className="text-4xl md:text-5xl font-bold mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {value}
                </div>
                <div className="text-amber-100 font-medium uppercase tracking-wider text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-teal-600 text-sm font-bold uppercase tracking-widest mb-3">Simple & Beautiful</p>
            <h2
              className="text-4xl font-bold text-slate-800"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map(({ icon, step, title, desc }) => (
              <div key={title} className="text-center group">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-4xl shadow-md group-hover:scale-110 transition-transform duration-300">
                    {icon}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {step}
                  </div>
                </div>
                <h3
                  className="text-xl font-bold text-slate-800 mb-3 mt-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              href="/travel/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full shadow-xl hover:from-amber-600 hover:to-orange-600 hover:scale-105 transition-all duration-200 text-lg"
            >
              <Heart className="h-5 w-5" />
              Start Sharing — It&#39;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="py-10 bg-slate-900 text-slate-400 text-center">
        <div
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Mapping Postcard
        </div>
        <p className="text-sm mb-5">Your adventures, beautifully captured.</p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/travel" className="hover:text-white transition-colors">Explore</Link>
          <Link href="/travel/new" className="hover:text-white transition-colors">Share Story</Link>
        </div>
        <p className="mt-6 text-xs text-slate-600">Made with ❤️ for travellers everywhere</p>
      </footer>
    </main>
  )
}
