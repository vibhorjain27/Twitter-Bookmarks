'use client'

import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Upload, X, FileJson } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UploadModalProps {
  open: boolean
  onClose: () => void
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  async function handleFile(file: File) {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.js')) {
      toast.error('Please upload a JSON file')
      return
    }

    setFileName(file.name)
    setIsUploading(true)

    try {
      let text = await file.text()

      // Handle Twitter's data export format (tweet.js starts with a variable assignment)
      if (text.startsWith('window.YTD')) {
        // e.g. window.YTD.bookmarks.part0 = [...]
        const match = text.match(/= (\[[\s\S]*\])/)
        if (match) text = match[1]
      }

      const data = JSON.parse(text)

      const res = await fetch('/api/bookmarks/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error ?? 'Upload failed')
      }

      toast.success(result.message)
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setIsUploading(false)
      setFileName(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Bookmarks</DialogTitle>
          <DialogDescription>
            Upload a JSON file containing your Twitter bookmarks. Accepts Twitter data export
            format or a custom array of bookmark objects.
          </DialogDescription>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.js"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-600">Importing {fileName}...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-slate-100 rounded-full">
                {isDragging ? (
                  <FileJson className="h-6 w-6 text-blue-500" />
                ) : (
                  <Upload className="h-6 w-6 text-slate-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Drop your file here or click to browse
                </p>
                <p className="text-xs text-slate-400 mt-1">JSON files only (.json, .js)</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <p className="font-medium">Accepted formats:</p>
          <p>• Twitter data export: <code className="bg-slate-100 px-1 rounded">bookmarks.js</code> from your Twitter archive</p>
          <p>• Custom JSON array: <code className="bg-slate-100 px-1 rounded">[{'{'}tweetId, tweetText, authorUsername, url{'}'}]</code></p>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  )
}
