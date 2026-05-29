'use client'

import { ExternalLink, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InboxItem {
  id: string
  title: string
  url: string | null
  cat: string
  status: string
  added: string
}

const CAT_LABELS: Record<string, string> = {
  stocks: 'Stocks',
  reading: 'Reading',
  travel: 'Travel / Food',
  life: 'Life & Advice',
  ai: 'AI Tools',
}

const CAT_COLORS: Record<string, string> = {
  stocks: 'bg-blue-100 text-blue-800',
  reading: 'bg-purple-100 text-purple-800',
  travel: 'bg-green-100 text-green-800',
  life: 'bg-orange-100 text-orange-800',
  ai: 'bg-pink-100 text-pink-800',
}

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600',
  inprogress: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'To action',
  inprogress: 'In progress',
  done: 'Done',
}

const ADVANCE_LABELS: Record<string, string> = {
  todo: 'Start',
  inprogress: 'Mark done',
}

interface Props {
  item: InboxItem
  onAdvance: (id: string) => void
  onDelete: (id: string) => void
}

export function InboxCard({ item, onAdvance, onDelete }: Props) {
  const isDone = item.status === 'done'

  return (
    <div
      className={cn(
        'border rounded-xl p-4 bg-white flex flex-col gap-3 transition-opacity',
        isDone && 'opacity-40'
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-900 hover:underline line-clamp-3 inline-flex items-start gap-1"
            >
              <span>{item.title}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5 text-slate-400" />
            </a>
          ) : (
            <p className="text-sm font-medium text-slate-900 line-clamp-3">{item.title}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="flex-shrink-0 p-1 text-slate-300 hover:text-red-400 transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              CAT_COLORS[item.cat] ?? 'bg-slate-100 text-slate-600'
            )}
          >
            {CAT_LABELS[item.cat] ?? item.cat}
          </span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              STATUS_COLORS[item.status] ?? 'bg-slate-100 text-slate-600'
            )}
          >
            {STATUS_LABELS[item.status] ?? item.status}
          </span>
        </div>
        {!isDone && (
          <button
            onClick={() => onAdvance(item.id)}
            className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-700 transition-colors"
          >
            {ADVANCE_LABELS[item.status] ?? 'Advance'}
          </button>
        )}
      </div>
    </div>
  )
}
