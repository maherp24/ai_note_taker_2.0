import Link from 'next/link'
import { FileText, Search, AlertTriangle } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'note' | 'search' | 'error'
  title: string
  message: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export default function EmptyState({ icon = 'note', title, message, action }: EmptyStateProps) {
  const icons = {
    note: <FileText className="w-32 h-32" />,
    search: <Search className="w-32 h-32" />,
    error: <AlertTriangle className="w-32 h-32" />,
  }

  return (
    <div className="hero bg-base-200 rounded-lg py-16">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="text-primary/30 mb-6 flex justify-center">
            {icons[icon]}
          </div>
          <h3 className="text-2xl font-medium mb-4">{title}</h3>
          <p className="text-base-content/70 mb-6">{message}</p>
          {action && (
            <>
              {action.href ? (
                <Link 
                  href={action.href} 
                  className="btn btn-primary"
                  aria-label={action.label}
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={action.onClick}
                  className="btn btn-primary"
                  aria-label={action.label}
                >
                  {action.label}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
