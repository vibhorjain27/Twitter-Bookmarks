'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To action' },
  { value: 'inprogress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

interface Props {
  statusFilter: string
  searchQuery: string
  onStatusChange: (s: string) => void
  onSearchChange: (s: string) => void
}

export function FilterBar({
  statusFilter,
  searchQuery,
  onStatusChange,
  onSearchChange,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex rounded-lg border overflow-hidden divide-x">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusChange(value)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === value
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search bookmarks..."
          className="w-full border rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
      </div>
    </div>
  )
}
