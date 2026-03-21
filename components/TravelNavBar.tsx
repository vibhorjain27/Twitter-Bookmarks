'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Plus, Compass, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TravelNavBar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Mapping Postcard
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all',
              pathname === '/'
                ? 'bg-amber-100 text-amber-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            href="/travel"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all',
              pathname === '/travel' || pathname.startsWith('/travel/')
                ? 'bg-amber-100 text-amber-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Explore</span>
          </Link>
          <Link
            href="/travel/new"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg ml-1"
          >
            <Plus className="h-4 w-4" />
            <span>Share Story</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
