'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Bookmark, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavBar() {
  const pathname = usePathname()

  const links = [
    { href: '/inbox', label: 'Inbox', icon: Inbox },
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/articles', label: 'Article List', icon: BookOpen },
  ]

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">BookmarkReader</span>
        </div>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
