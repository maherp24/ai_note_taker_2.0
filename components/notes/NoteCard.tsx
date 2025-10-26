import Link from 'next/link'
import { Clock } from 'lucide-react'

interface NoteCardProps {
  id: string
  title?: string | null
  content?: string | null
  summary?: string | null
  tags?: string[] | null
  createdAt: string
}

export default function NoteCard({
  id,
  title,
  content,
  summary,
  tags,
  createdAt,
}: NoteCardProps) {
  const displayTitle = title || content?.substring(0, 60) || 'Untitled Note'
  const preview = summary || content?.substring(0, 150) || 'No content'
  const formattedDate = new Date(createdAt).toLocaleDateString()

  return (
    <Link href={`/notes/${id}`} aria-label={`View note: ${displayTitle}`}>
      <div
        className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer border border-base-300"
      >
        <div className="card-body p-6">
          <h3 className="card-title text-foreground tracking-tight text-[24px] mb-3">{displayTitle}</h3>
          
          {/* AI Summary indicator if summary exists */}
          {summary && (
            <div className="flex items-center gap-1 mb-2 text-xs text-primary/70">
              <span>✨</span>
              <span className="font-medium">AI Summary</span>
            </div>
          )}
          
          <p className="text-base-content/70 line-clamp-3 mb-4">{preview}</p>
          
          <div className="flex flex-wrap gap-2 mt-auto">
            {tags && tags.length > 0 ? (
              tags.map((tag) => (
                <span key={tag} className="badge badge-secondary gap-1">
                  {tag}
                </span>
              ))
            ) : null}
          </div>
          
          <div className="flex items-center justify-between mt-3 opacity-60">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            {summary && (
              <span className="text-xs text-primary/70">🤖 AI</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
