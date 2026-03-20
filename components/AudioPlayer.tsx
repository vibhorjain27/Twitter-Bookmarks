'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Square, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  text: string
  label: string
}

const CHUNK_SIZE = 200 // words per chunk (browser limit ~250 chars, we use words)

function splitIntoChunks(text: string, wordsPerChunk: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text]
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    const wordCount = (current + sentence).split(/\s+/).length
    if (wordCount > wordsPerChunk && current.length > 0) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current += sentence
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks.length > 0 ? chunks : [text]
}

export function AudioPlayer({ text, label }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [chunkIndex, setChunkIndex] = useState(0)
  const chunksRef = useRef<string[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    function loadVoices() {
      const available = window.speechSynthesis.getVoices()
      if (available.length > 0) {
        const englishVoices = available.filter((v) => v.lang.startsWith('en'))
        setVoices(englishVoices.length > 0 ? englishVoices : available)
        if (!selectedVoice && available.length > 0) {
          const def = available.find((v) => v.default) ?? available[0]
          setSelectedVoice(def.name)
        }
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [selectedVoice])

  function speakChunk(chunks: string[], index: number) {
    if (index >= chunks.length) {
      setIsPlaying(false)
      setIsPaused(false)
      setChunkIndex(0)
      return
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index])
    utterance.rate = speed
    utterance.lang = 'en-US'

    const voice = voices.find((v) => v.name === selectedVoice)
    if (voice) utterance.voice = voice

    utterance.onend = () => {
      const next = index + 1
      setChunkIndex(next)
      speakChunk(chunks, next)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  function handlePlay() {
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    window.speechSynthesis.cancel()
    chunksRef.current = splitIntoChunks(text, CHUNK_SIZE)
    setChunkIndex(0)
    setIsPlaying(true)
    setIsPaused(false)
    speakChunk(chunksRef.current, 0)
  }

  function handlePause() {
    window.speechSynthesis.pause()
    setIsPaused(true)
    setIsPlaying(false)
  }

  function handleStop() {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setChunkIndex(0)
  }

  const progress =
    chunksRef.current.length > 0 ? Math.round((chunkIndex / chunksRef.current.length) * 100) : 0

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Audio: {label}</span>
        {(isPlaying || isPaused) && chunksRef.current.length > 0 && (
          <span className="text-xs text-slate-400 ml-auto">
            {progress}% — chunk {chunkIndex}/{chunksRef.current.length}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {!isPlaying || isPaused ? (
          <Button size="sm" onClick={handlePlay} className="gap-1">
            <Play className="h-3 w-3" />
            {isPaused ? 'Resume' : 'Play'}
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={handlePause} className="gap-1">
            <Pause className="h-3 w-3" />
            Pause
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={handleStop}
          disabled={!isPlaying && !isPaused}
          className="gap-1"
        >
          <Square className="h-3 w-3" />
          Stop
        </Button>

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-slate-500">Speed:</span>
          {[0.75, 1, 1.25, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                speed === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {voices.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Voice:</span>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 max-w-[200px] truncate"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {(isPlaying || isPaused) && chunksRef.current.length > 0 && (
        <div className="w-full bg-slate-200 rounded-full h-1">
          <div
            className="bg-slate-700 h-1 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
