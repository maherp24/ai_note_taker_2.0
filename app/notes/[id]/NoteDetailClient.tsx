'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Edit2, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import StreamingAISummary from '@/components/StreamingAISummary'

interface NoteDetailClientProps {
  note: {
    id: string
    title?: string | null
    content?: string | null
    summary?: string | null
    tags?: string[] | null
    created_at: string
    updated_at?: string | null
    tokens?: number | null
    source_type?: string | null
    file_url?: string | null
  }
  displayTitle: string
  formattedDate: string
  formattedUpdateDate: string
}

export default function NoteDetailClient({
  note,
  displayTitle,
  formattedDate,
  formattedUpdateDate,
}: NoteDetailClientProps) {
  const router = useRouter()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(displayTitle)
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [showStreaming, setShowStreaming] = useState(false)
  const [currentSummary, setCurrentSummary] = useState(note.summary)
  const [currentTags, setCurrentTags] = useState(note.tags)

  const wordCount = note.content ? note.content.split(/\s+/).length : 0
  const shouldAutoProcess = wordCount <= 5000

  // Auto-start streaming if no summary and content is eligible
  useEffect(() => {
    if (!currentSummary && note.content && note.content.length >= 10 && shouldAutoProcess) {
      setShowStreaming(true)
    }
  }, [])

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      setTitleError('Title cannot be empty')
      return
    }

    setIsSavingTitle(true)
    setTitleError(null)

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update title')
      }

      setIsEditingTitle(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating title:', error)
      setTitleError('Failed to update title. Please try again.')
    } finally {
      setIsSavingTitle(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedTitle(displayTitle)
    setIsEditingTitle(false)
    setTitleError(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="card bg-base-200">
          <div className="card-body p-8">
            {/* Editable Title */}
            <div className="mb-6">
              {isEditingTitle ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="input input-bordered w-full text-3xl font-bold"
                    placeholder="Enter note title..."
                    disabled={isSavingTitle}
                    autoFocus
                  />
                  {titleError && (
                    <div className="alert alert-error py-2 text-sm">
                      <span>{titleError}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveTitle}
                      className="btn btn-primary btn-sm"
                      disabled={isSavingTitle}
                    >
                      {isSavingTitle ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Title
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-ghost btn-sm"
                      disabled={isSavingTitle}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <h1 className="flex-1">{displayTitle}</h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="btn btn-ghost btn-sm"
                    title="Edit title"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* AI Summary Section - Now above content */}
            {showStreaming ? (
              <div className="mb-8">
                <StreamingAISummary
                  noteId={note.id}
                  onComplete={(summary, tags) => {
                    setCurrentSummary(summary)
                    setCurrentTags(tags)
                    setShowStreaming(false)
                    router.refresh()
                  }}
                  onError={(error) => {
                    console.error('Streaming error:', error)
                    setShowStreaming(false)
                  }}
                />
              </div>
            ) : currentSummary ? (
              <div className="mb-8 card bg-base-100 border-l-4 border-primary">
                <div className="card-body p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">✨</span>
                    <h3 className="text-lg font-medium">AI Summary</h3>
                    <span className="badge badge-primary badge-sm">GPT-4</span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-base-content/90 leading-relaxed">{currentSummary}</p>
                  </div>
                </div>
              </div>
            ) : shouldAutoProcess ? (
              <div className="mb-8 card bg-base-200 border-l-4 border-base-300">
                <div className="card-body p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💤</span>
                    <h3 className="text-lg font-medium text-base-content/70">No AI Summary Yet</h3>
                  </div>
                  <p className="text-sm text-base-content/60">
                    Add more content to automatically generate an AI summary.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Full Content */}
            <div className="divider"></div>
            <h3 className="mb-2">Full Content</h3>
            {note.content ? (
              <div className="prose max-w-none whitespace-pre-wrap">
                {note.content}
              </div>
            ) : note.file_url ? (
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>This note has an attached file. File processing is not yet implemented.</span>
              </div>
            ) : (
              <p className="text-base-content/70">No content available.</p>
            )}

            {/* AI Tags */}
            {currentTags && currentTags.length > 0 && (
              <>
                <div className="divider"></div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span>🏷️</span>
                    <h3 className="text-sm font-medium">AI-Generated Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentTags.map((tag: string) => (
                      <span key={tag} className="badge badge-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* AI Processing Info */}
            {!shouldAutoProcess && (
              <div className="mt-6">
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <div className="font-bold">Large Note Detected</div>
                    <div className="text-sm">
                      This note has {wordCount.toLocaleString()} words (over 5,000 word limit). 
                      AI processing is disabled for large notes to manage costs.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Sidebar */}
      <div className="lg:col-span-1">
        <div className="card bg-base-200">
          <div className="card-body p-6">
            <h3 className="mb-6">Metadata</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 opacity-70 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Created</span>
                </div>
                <p className="text-sm">
                  {formattedDate}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 opacity-70 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Last Updated</span>
                </div>
                <p className="text-sm">
                  {formattedUpdateDate}
                </p>
              </div>

              <div className="divider my-2"></div>
              
              {note.content && (
                <>
                  <div>
                    <p className="text-sm opacity-70">Word Count</p>
                    <p className="text-sm">{wordCount.toLocaleString()} words</p>
                  </div>
                  
                  <div>
                    <p className="text-sm opacity-70">Character Count</p>
                    <p className="text-sm">{note.content.length.toLocaleString()} characters</p>
                  </div>
                </>
              )}

              {note.tokens && note.tokens > 0 && (
                <div>
                  <p className="text-sm opacity-70">Tokens</p>
                  <p className="text-sm">{note.tokens.toLocaleString()}</p>
                </div>
              )}
              
              {note.source_type && (
                <div>
                  <p className="text-sm opacity-70">Source Type</p>
                  <p className="text-sm capitalize">{note.source_type}</p>
                </div>
              )}

              {shouldAutoProcess && note.content && (
                <>
                  <div className="divider my-2"></div>
                  <div className="text-xs text-base-content/60">
                    <p className="flex items-center gap-1">
                      <span>🤖</span>
                      <span>AI processing automatic for notes under 5,000 words</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

