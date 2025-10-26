import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().min(1),
  tags: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = searchSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { query, tags } = validationResult.data

    // TODO: Generate embedding for search query
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    // const queryEmbedding = await openai.embeddings.create({
    //   model: 'text-embedding-3-small',
    //   input: query,
    // })

    // TODO: Perform hybrid search
    // 1. Vector search over note_chunks
    // const { data: vectorResults } = await supabase.rpc('match_note_chunks', {
    //   query_embedding: queryEmbedding.data[0].embedding,
    //   match_threshold: 0.7,
    //   match_count: 10,
    // })

    // 2. Keyword search over notes (title, content, summary)
    let notesQuery = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      notesQuery = notesQuery.overlaps('tags', tags)
    }

    const { data: keywordResults, error: searchError } = await notesQuery
      .order('created_at', { ascending: false })
      .limit(20)

    if (searchError) {
      console.error('Search error:', searchError)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    // TODO: Merge and rank results from vector and keyword search
    // For now, just return keyword results

    return NextResponse.json({
      results: keywordResults || [],
      count: keywordResults?.length || 0,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

