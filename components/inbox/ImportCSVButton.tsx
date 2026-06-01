'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

// RFC 4180-compliant CSV parser (handles quoted fields with embedded newlines and escaped quotes)
function parseCSV(raw: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (inQuotes) {
      if (c === '"' && raw[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') { inQuotes = false }
      else { field += c }
    } else {
      if (c === '"') { inQuotes = true }
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else if (c !== '\r') { field += c }
    }
  }
  if (row.length > 0 || field) { row.push(field); rows.push(row) }
  return rows
}

// Keyword-based auto-categorizer tuned to this user's bookmark profile
function categorize(text: string): string {
  const t = text.toLowerCase()

  // Travel — specific outdoor/place/food signals
  if (/road trip|coastal ride|solo.*ride.*km|itinerary|hidden gem|places to (eat|visit|see)|travel guide|food tour|\btrek\b|100 spots|coastal.*km/.test(t)) return 'travel'

  // Life & Advice — specific mindset/reflection phrases
  if (/cheat code to life|harshest truth|doing the work is hard|rooting for you|every young man|cost of avoiding work|deeply cruel age|regret.*potential|potential.*regret|fatigue from.*work|most valuable.*education|making yourself do|what if.*actually tried|the most valuable of all/.test(t)) return 'life'
  if (/\b(mindset|discipline|hustle|grind)\b/.test(t) && !/invest|stock|portfolio|₹| cr |company|market|sector/.test(t)) return 'life'

  // AI Tools — workflow/model/tool context (not stock analysis)
  if (/claude code|claude skill|copilot enterprise|built with (claude|gpt|ai)\b|mcp server|prompt engineer|agentic.*build|d2c.*agent|ai workflow/.test(t) && !/invest|stock|\$[A-Z]{2,5}|portfolio/.test(t)) return 'ai'

  // Reading — X article links with no financial signals
  if (/x\.com\/i\/article\//.test(t) && !/₹|crore|\bstock\b|\binvest\b|company/.test(t)) return 'reading'

  // Default: stocks (covers India + US stocks, macro, sector analysis)
  return 'stocks'
}

interface Props {
  onImported: () => void
}

export function ImportCSVButton({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)

    try {
      const raw = await file.text()
      const rows = parseCSV(raw)
      if (rows.length < 2) { toast.error('No bookmarks found in CSV'); return }

      const headers = rows[0]
      const idx = (name: string) => headers.indexOf(name)
      const idIdx = idx('id')
      const usernameIdx = idx('username')
      const textIdx = idx('text')
      const createdIdx = idx('created_at')

      if (idIdx === -1 || textIdx === -1) {
        toast.error('Unrecognized CSV format — expected columns: id, username, text, created_at')
        return
      }

      const items = rows
        .slice(1)
        .filter(r => r.length > textIdx && r[idIdx] && r[textIdx])
        .map(r => ({
          title: r[textIdx].trim().slice(0, 280),
          url: `https://x.com/${r[usernameIdx]}/status/${r[idIdx]}`,
          cat: categorize(r[textIdx]),
          sourceId: r[idIdx],
          added: r[createdIdx] ? new Date(r[createdIdx]).toISOString() : new Date().toISOString(),
        }))

      if (items.length === 0) { toast.error('No valid rows found'); return }

      toast.loading(`Importing ${items.length} bookmarks…`, { id: 'csv-import' })

      const res = await fetch('/api/inbox/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Server error')

      toast.success(
        data.skipped > 0
          ? `Imported ${data.imported} bookmarks (${data.skipped} already existed)`
          : `Imported ${data.imported} bookmarks`,
        { id: 'csv-import', duration: 5000 }
      )
      onImported()
    } catch (err) {
      toast.error(`Import failed: ${err}`, { id: 'csv-import' })
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        <Upload className="h-3.5 w-3.5" />
        {loading ? 'Importing…' : 'Import CSV'}
      </button>
    </>
  )
}
