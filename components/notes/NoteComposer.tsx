'use client'

import { FormEvent, useState } from 'react'
import { Plus } from 'lucide-react'

interface NoteComposerProps {
  onSubmit: (data: { title: string; content: string; file?: File }) => Promise<void>
  isLoading?: boolean
}

export default function NoteComposer({ onSubmit, isLoading }: NoteComposerProps) {
  const [content, setContent] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    
    await onSubmit({ title: 'Quick Note', content })
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="textarea textarea-bordered bg-background text-foreground w-full placeholder:text-muted-foreground"
        placeholder="Type or paste your note here... AI will process it automatically"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
        aria-label="Note content"
      />
      <div className="card-actions justify-end">
        <button 
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !content.trim()}
          aria-label="Add note"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Processing...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Note
            </>
          )}
        </button>
      </div>
    </form>
  )
}
