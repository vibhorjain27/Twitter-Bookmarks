'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AudioPlayer } from '@/components/AudioPlayer'

interface SummaryPanelProps {
  articleId: string
  existingSummary: string | null
  onSummaryGenerated: (summary: string) => void
}

export function SummaryPanel({
  articleId,
  existingSummary,
  onSummaryGenerated,
}: SummaryPanelProps) {
  const [summary, setSummary] = useState(existingSummary ?? '')
  const [isGenerating, setIsGenerating] = useState(false)

  async function generateSummary() {
    setIsGenerating(true)
    setSummary('')

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to generate summary')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          full += chunk
          setSummary((prev) => prev + chunk)
        }
      }

      onSummaryGenerated(full)
      toast.success('Summary generated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">AI Summary</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={generateSummary}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : summary ? (
            <>
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              Generate Summary
            </>
          )}
        </Button>
      </div>

      {summary ? (
        <>
          <div className="prose prose-sm max-w-none bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div className="whitespace-pre-wrap text-slate-800 text-sm leading-relaxed">
              {summary}
            </div>
          </div>
          <AudioPlayer text={summary} label="Summary" />
        </>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-8 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">
            {isGenerating
              ? 'Generating summary via Groq AI...'
              : 'Click "Generate Summary" to create an AI-powered summary of this article.'}
          </p>
        </div>
      )}
    </div>
  )
}
