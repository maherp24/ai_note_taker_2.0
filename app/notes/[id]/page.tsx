import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/layout/NavBar'
import EmptyState from '@/components/EmptyState'
import NoteDetailClient from './NoteDetailClient'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function NotePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch note
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !note) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container mx-auto px-6 py-10 max-w-6xl">
          <EmptyState
            icon="error"
            title="Note not found"
            message="The note you're looking for doesn't exist or you don't have access to it."
            action={{ label: 'Go to Dashboard', href: '/' }}
          />
        </main>
      </div>
    )
  }

  const displayTitle = note.title || note.content?.substring(0, 60) || 'Untitled Note'
  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedUpdateDate = new Date(note.updated_at || note.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-6 py-10 max-w-6xl">
        <div className="mb-8">
          <Link href="/" className="btn btn-ghost btn-sm">
            ← Back
          </Link>
        </div>

        <NoteDetailClient
          note={note}
          displayTitle={displayTitle}
          formattedDate={formattedDate}
          formattedUpdateDate={formattedUpdateDate}
        />
      </main>
    </div>
  )
}
