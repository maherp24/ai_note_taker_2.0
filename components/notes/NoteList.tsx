import NoteCard from './NoteCard'

interface Note {
  id: string
  title?: string | null
  content?: string | null
  summary?: string | null
  tags?: string[] | null
  created_at: string
}

interface NoteListProps {
  notes: Note[]
}

export default function NoteList({ notes }: NoteListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          id={note.id}
          title={note.title}
          content={note.content}
          summary={note.summary}
          tags={note.tags}
          createdAt={note.created_at}
        />
      ))}
    </div>
  )
}
