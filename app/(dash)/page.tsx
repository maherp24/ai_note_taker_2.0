'use client'

import { useState, useEffect } from 'react'
import NavBar from '@/components/layout/NavBar'
import NoteComposer from '@/components/notes/NoteComposer'
import NoteList from '@/components/notes/NoteList'
import EmptyState from '@/components/EmptyState'
import StreamingAISummary from '@/components/StreamingAISummary'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Clock } from 'lucide-react'

interface Note {
  id: string
  title?: string | null
  content?: string | null
  summary?: string | null
  tags?: string[] | null
  created_at: string
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingNotes, setIsLoadingNotes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streamingNoteId, setStreamingNoteId] = useState<string | null>(null)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoadingNotes(false)
        return
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setNotes(data || [])
    } catch (err) {
      console.error('Error loading notes:', err)
      setError('Failed to load notes')
    } finally {
      setIsLoadingNotes(false)
    }
  }

  const handleCreateNote = async (data: { title: string; content: string; file?: File }) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('content', data.content)
      formData.append('source_type', data.file ? 'text' : 'text')
      if (data.file) {
        formData.append('file', data.file)
      }

      const response = await fetch('/api/notes', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create note')
      }

      // Show success message
      setError(null)
      
      // Check if note should be AI processed (word count check)
      const wordCount = data.content.split(/\s+/).length
      
      if (wordCount <= 5000 && wordCount >= 10) {
        // Start streaming AI processing
        setStreamingNoteId(result.note.id)
      }
      
      // Reload notes to show the new note
      await loadNotes()
      
    } catch (err) {
      console.error('Error creating note:', err)
      setError(err instanceof Error ? err.message : 'Failed to create note')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-6 py-10 max-w-6xl">
        {/* Hero Section - Quick Capture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="card bg-base-200 border border-base-300">
              <div className="card-body p-8">
                <h2 className="card-title mb-4">
                  <Sparkles className="w-6 h-6" />
                  Quick Capture
                </h2>
                {error && (
                  <div className="alert alert-error mb-4" role="alert">
                    <span>{error}</span>
                  </div>
                )}
                <NoteComposer onSubmit={handleCreateNote} isLoading={isLoading} />
              </div>
            </div>
          </div>
          
          {/* Tips Section */}
          <div className="card bg-base-200">
            <div className="card-body p-6">
              <h3 className="card-title text-base mb-4">Tips & AI Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✨</span>
                  <span className="text-sm">AI automatically summarizes your notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🏷️</span>
                  <span className="text-sm">Smart tags generated for easy organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🔍</span>
                  <span className="text-sm">Semantic search finds related content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">⌨️</span>
                  <span className="text-sm">Press <kbd className="kbd kbd-xs">⌘K</kbd> to quick search</span>
                </li>
              </ul>
              <div className="divider my-4"></div>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Clock className="w-4 h-4" />
                <span>AI processing happens in seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Streaming AI Summary */}
        {streamingNoteId && (
          <div className="mb-12">
            <StreamingAISummary 
              noteId={streamingNoteId}
              onComplete={(summary, tags) => {
                // Reload notes to show updated AI data
                loadNotes()
                setStreamingNoteId(null)
              }}
              onError={(error) => {
                console.error('Streaming error:', error)
                setStreamingNoteId(null)
              }}
            />
          </div>
        )}

        {/* Recent Notes Grid */}
        <div className="mb-8">
          <h2 className="mb-2">Recent Notes</h2>
        </div>
        
        {isLoadingNotes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card bg-base-200 border border-base-300">
                <div className="card-body p-4">
                  <div className="skeleton h-6 w-3/4 mb-3"></div>
                  <div className="skeleton h-4 w-full mb-2"></div>
                  <div className="skeleton h-4 w-5/6 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="skeleton h-6 w-16"></div>
                    <div className="skeleton h-6 w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notes.length > 0 ? (
          <NoteList notes={notes} />
        ) : (
          <EmptyState
            icon="note"
            title="No notes yet"
            message="Start by creating your first note above. AI will automatically process and tag it for you."
          />
        )}
      </main>
    </div>
  )
}
