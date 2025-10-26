'use client'

import { useState, useEffect } from 'react'
import NavBar from '@/components/layout/NavBar'
import SearchBar from '@/components/SearchBar'
import TagPills from '@/components/TagPills'
import NoteList from '@/components/notes/NoteList'
import EmptyState from '@/components/EmptyState'
import { Filter } from 'lucide-react'

interface Note {
  id: string
  title?: string | null
  content?: string | null
  summary?: string | null
  tags?: string[] | null
  created_at: string
}

export default function SearchPage() {
  const [results, setResults] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [lastQuery, setLastQuery] = useState('')

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const input = document.querySelector<HTMLInputElement>('input[name="query"]')
        input?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Extract unique tags from results
  const availableTags = Array.from(
    new Set(results.flatMap((note) => note.tags || []))
  ).sort()

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(true)
    setLastQuery(query)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.results || [])
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  // Filter results by selected tags
  const filteredResults = selectedTags.length === 0 
    ? results 
    : results.filter(note => 
        selectedTags.every(tag => note.tags?.includes(tag))
      )

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-6 py-10 max-w-6xl">
        {/* Search Header */}
        <div className="mb-10">
          <h1 className="mb-6">Search Notes</h1>
          <SearchBar 
            onSearch={handleSearch}
            defaultValue={lastQuery}
            isLoading={isLoading}
            placeholder="Search by title, content, or tags..."
            showKeyboardHint
          />
        </div>

        {/* Filters */}
        {availableTags.length > 0 && (
          <div className="card bg-base-200 mb-10">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5" />
                <h3>Filter by Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <TagPills
                  tags={availableTags}
                  selectedTags={selectedTags}
                  onTagClick={handleTagClick}
                  interactive
                />
              </div>
              {selectedTags.length > 0 && (
                <>
                  <div className="divider my-2"></div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm opacity-70">Active filters:</span>
                    <TagPills
                      tags={selectedTags}
                      selectedTags={selectedTags}
                      onRemove={handleTagRemove}
                    />
                    <button 
                      className="btn btn-ghost btn-xs"
                      onClick={() => setSelectedTags([])}
                    >
                      Clear all
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-8">
          <h2 className="mb-2">
            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card bg-base-200 border border-base-300">
                <div className="card-body p-4">
                  <div className="skeleton h-6 w-3/4 mb-3"></div>
                  <div className="skeleton h-4 w-full mb-2"></div>
                  <div className="skeleton h-4 w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          filteredResults.length > 0 ? (
            <NoteList notes={filteredResults} />
          ) : (
            <EmptyState
              icon="search"
              title="No results found"
              message="Try adjusting your search query or filters"
            />
          )
        ) : (
          <EmptyState
            icon="search"
            title="Start searching"
            message="Enter a query above to find notes by keyword or meaning."
          />
        )}
      </main>
    </div>
  )
}
