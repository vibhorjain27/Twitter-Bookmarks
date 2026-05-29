'use client'

import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { NavBar } from '@/components/NavBar'
import { CategoryTabs } from '@/components/inbox/CategoryTabs'
import { InboxCard, type InboxItem } from '@/components/inbox/InboxCard'
import { AddItemDialog } from '@/components/inbox/AddItemDialog'
import { StatsBar } from '@/components/inbox/StatsBar'
import { FilterBar } from '@/components/inbox/FilterBar'

const STATUS_ORDER: Record<string, number> = { todo: 0, inprogress: 1, done: 2 }

export default function InboxPage() {
  const [selectedCat, setSelectedCat] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ items: InboxItem[] }>({
    queryKey: ['inbox'],
    queryFn: () => fetch('/api/inbox').then(r => r.json()),
  })

  const allItems = data?.items ?? []

  const filtered = useMemo(() => {
    let items = allItems
    if (selectedCat !== 'all') items = items.filter(i => i.cat === selectedCat)
    if (statusFilter !== 'all') items = items.filter(i => i.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(i => i.title.toLowerCase().includes(q))
    }
    return [...items].sort((a, b) => {
      const sd = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
      if (sd !== 0) return sd
      return new Date(b.added).getTime() - new Date(a.added).getTime()
    })
  }, [allItems, selectedCat, statusFilter, searchQuery])

  async function handleAdvance(id: string) {
    try {
      const res = await fetch(`/api/inbox/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error('Failed')
      queryClient.invalidateQueries({ queryKey: ['inbox'] })
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/inbox/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      queryClient.invalidateQueries({ queryKey: ['inbox'] })
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bookmark Inbox</h1>
            <p className="text-sm text-slate-500 mt-0.5">Find, action, and clear your backlog</p>
          </div>
          <AddItemDialog onAdded={() => queryClient.invalidateQueries({ queryKey: ['inbox'] })} />
        </div>

        {allItems.length > 0 && <StatsBar items={allItems} />}

        <CategoryTabs selected={selectedCat} items={allItems} onSelect={setSelectedCat} />

        <FilterBar
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          onStatusChange={setStatusFilter}
          onSearchChange={setSearchQuery}
        />

        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            {allItems.length === 0
              ? 'No bookmarks yet — add your first one above'
              : 'No bookmarks match your filters'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <InboxCard
                key={item.id}
                item={item}
                onAdvance={handleAdvance}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
