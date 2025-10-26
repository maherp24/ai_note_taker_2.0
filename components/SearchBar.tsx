'use client'

import { FormEvent } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  defaultValue?: string
  isLoading?: boolean
  placeholder?: string
  showKeyboardHint?: boolean
}

export default function SearchBar({ 
  onSearch, 
  defaultValue = '', 
  isLoading,
  placeholder = "Search notes...",
  showKeyboardHint = false
}: SearchBarProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('query') as string
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="form-control w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
          <input
            type="text"
            name="query"
            placeholder={placeholder}
            className="input input-bordered w-full pl-10 pr-4"
            defaultValue={defaultValue}
            disabled={isLoading}
            aria-label="Search query"
          />
          {showKeyboardHint && (
            <kbd className="kbd kbd-sm absolute right-3 top-1/2 -translate-y-1/2">⌘K</kbd>
          )}
        </div>
      </div>
    </form>
  )
}
