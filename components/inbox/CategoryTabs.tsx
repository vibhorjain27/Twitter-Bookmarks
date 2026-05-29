'use client'

import { cn } from '@/lib/utils'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'stocks', label: 'Stocks' },
  { key: 'reading', label: 'Reading' },
  { key: 'travel', label: 'Travel / Food' },
  { key: 'life', label: 'Life & Advice' },
  { key: 'ai', label: 'AI Tools' },
] as const

interface Item {
  cat: string
  status: string
}

interface Props {
  selected: string
  items: Item[]
  onSelect: (cat: string) => void
}

export function CategoryTabs({ selected, items, onSelect }: Props) {
  function pendingCount(cat: string) {
    const scoped = cat === 'all' ? items : items.filter(i => i.cat === cat)
    return scoped.filter(i => i.status !== 'done').length
  }

  return (
    <div className="flex flex-wrap gap-2 pb-1">
      {CATEGORIES.map(({ key, label }) => {
        const count = pendingCount(key)
        const active = selected === key
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              active
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            )}
          >
            {label}
            {count > 0 && (
              <span
                className={cn(
                  'text-xs rounded-full px-1.5 py-0.5 font-semibold leading-none',
                  active ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
