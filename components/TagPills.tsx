'use client'

interface TagPillsProps {
  tags: string[]
  selectedTags?: string[]
  onTagClick?: (tag: string) => void
  onRemove?: (tag: string) => void
  interactive?: boolean
}

export default function TagPills({ 
  tags, 
  selectedTags = [], 
  onTagClick, 
  onRemove,
  interactive = false 
}: TagPillsProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag)
        return (
          <span
            key={tag}
            className={`badge badge-secondary gap-1 ${interactive ? 'cursor-pointer hover:badge-accent' : ''}`}
            onClick={() => onTagClick?.(tag)}
            role={interactive ? 'button' : undefined}
            aria-label={isSelected ? `Remove filter: ${tag}` : `Add filter: ${tag}`}
            aria-pressed={isSelected}
          >
            {tag}
            {isSelected && onRemove && (
              <button
                className="btn btn-ghost btn-xs p-0 h-auto min-h-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(tag)
                }}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        )
      })}
    </div>
  )
}
