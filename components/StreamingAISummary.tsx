'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

interface StreamingAISummaryProps {
  noteId: string
  onComplete?: (summary: string, tags: string[]) => void
  onError?: (error: string) => void
}

export default function StreamingAISummary({ 
  noteId, 
  onComplete, 
  onError 
}: StreamingAISummaryProps) {
  const [streamingText, setStreamingText] = useState('')
  const [status, setStatus] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

    const startStreaming = async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}/stream`)
        
        if (!response.ok) {
          throw new Error('Failed to start AI processing')
        }

        if (!response.body) {
          throw new Error('Response body is null')
        }

        reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                switch (data.type) {
                  case 'status':
                    setStatus(data.message)
                    break
                  
                  case 'summary':
                    setStreamingText(prev => prev + data.content)
                    break
                  
                  case 'tags':
                    setTags(data.tags)
                    break
                  
                  case 'complete':
                    setIsComplete(true)
                    setStatus('Complete!')
                    onComplete?.(data.summary, data.tags)
                    break
                  
                  case 'error':
                    setHasError(true)
                    setStatus(data.message)
                    onError?.(data.message)
                    break
                }
              } catch (e) {
                console.error('Parse error:', e)
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error)
        setHasError(true)
        setStatus('AI processing failed')
        onError?.('AI processing failed')
      }
    }

    startStreaming()

    return () => {
      reader?.cancel()
    }
  }, [noteId, onComplete, onError])

  if (hasError) {
    return (
      <div className="card bg-base-200 border-l-4 border-error">
        <div className="card-body p-6">
          <div className="flex items-center gap-2 text-error">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-medium">AI Processing Failed</h3>
          </div>
          <p className="text-sm text-base-content/70">{status}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-200 border-l-4 border-primary animate-pulse-slow">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {isComplete ? (
            <span className="text-2xl">✨</span>
          ) : (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          )}
          <h3 className="text-lg font-medium">
            {isComplete ? 'AI Summary' : 'AI Generating Summary...'}
          </h3>
          <span className="badge badge-primary badge-sm">GPT-4</span>
          {!isComplete && (
            <span className="loading loading-dots loading-sm ml-auto"></span>
          )}
        </div>

        {/* Status Message */}
        {status && !isComplete && (
          <div className="text-xs text-primary/70 mb-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>{status}</span>
          </div>
        )}

        {/* Streaming Text */}
        <div className="prose max-w-none">
          <p className="text-base-content/90 leading-relaxed">
            {streamingText}
            {!isComplete && (
              <span className="inline-block w-2 h-4 bg-primary/70 ml-1 animate-pulse"></span>
            )}
          </p>
        </div>

        {/* Tags (appear after summary) */}
        {tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-base-300">
            <div className="flex items-center gap-2 mb-2">
              <span>🏷️</span>
              <span className="text-sm font-medium">AI-Generated Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={tag} 
                  className="badge badge-secondary animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

