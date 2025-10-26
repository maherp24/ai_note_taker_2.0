import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the note
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Get text to process
    let textToProcess = note.content || ''

    if (note.file_url && !textToProcess) {
      // TODO: Implement file extraction for PDF/audio
      console.log('TODO: Extract text from file:', note.file_url)
    }

    if (!textToProcess || textToProcess.length < 10) {
      return NextResponse.json(
        { error: 'Insufficient content to process. Need at least 10 characters.' },
        { status: 400 }
      )
    }

    // Check word count - don't auto-process if over 5000 words
    const wordCount = textToProcess.split(/\s+/).length
    if (wordCount > 5000) {
      return NextResponse.json(
        { 
          error: 'Note exceeds 5,000 word limit for AI processing',
          wordCount,
          message: 'Large notes are not automatically processed to manage costs. This note has ' + wordCount.toLocaleString() + ' words.'
        },
        { status: 400 }
      )
    }

    // Chunk text for embeddings (800-1200 chars, 100-200 overlap)
    const chunks = chunkText(textToProcess, 1000, 150)
    console.log(`Created ${chunks.length} chunks for note ${id}`)

    // Generate embeddings for chunks
    try {
      for (const [index, chunk] of chunks.entries()) {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk,
        })
        
        await supabase.from('note_chunks').insert({
          note_id: note.id,
          chunk_index: index,
          content: chunk,
          embedding: embeddingResponse.data[0].embedding,
        })
      }
    } catch (error) {
      console.error('Embedding generation error:', error)
      // Continue with summary and tags even if embeddings fail
    }

    // Generate AI summary
    let summary = ''
    try {
      const summaryResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that creates concise summaries. Summarize the following note in 2-3 clear sentences. Focus on the main ideas and key points.' 
          },
          { role: 'user', content: textToProcess },
        ],
        temperature: 0.3,
        max_tokens: 200,
      })

      summary = summaryResponse.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Summary generation error:', error)
      summary = `Note about: ${textToProcess.substring(0, 100)}...`
    }

    // Generate AI tags
    let tags: string[] = []
    try {
      const tagsResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that generates relevant tags. Generate 3-5 relevant, concise tags for this note. Return ONLY a JSON array of lowercase strings, like: ["tag1", "tag2", "tag3"]. No additional text.' 
          },
          { role: 'user', content: textToProcess },
        ],
        temperature: 0.5,
        max_tokens: 100,
      })

      const tagsContent = tagsResponse.choices[0]?.message?.content || '[]'
      
      // Parse the tags from the response
      try {
        const parsedTags = JSON.parse(tagsContent)
        if (Array.isArray(parsedTags)) {
          tags = parsedTags.slice(0, 5).map((tag: string) => tag.toLowerCase())
        }
      } catch (parseError) {
        // If parsing fails, try to extract tags from the text
        const matches = tagsContent.match(/"([^"]+)"/g)
        if (matches) {
          tags = matches.map(m => m.replace(/"/g, '').toLowerCase()).slice(0, 5)
        }
      }
      
      // Fallback if no tags generated
      if (tags.length === 0) {
        tags = ['general', 'note']
      }
    } catch (error) {
      console.error('Tags generation error:', error)
      tags = ['general', 'note']
    }

    // Calculate approximate tokens
    const estimatedTokens = Math.ceil(textToProcess.length / 4)

    // Update note with AI-generated data
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        summary,
        tags,
        tokens: estimatedTokens,
      })
      .eq('id', note.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update note with AI data' },
        { status: 500 }
      )
    }

    // Log event
    await supabase.from('note_events').insert({
      note_id: note.id,
      user_id: user.id,
      event_type: 'summarized',
      details: { 
        chunks: chunks.length, 
        tags,
        tokens: estimatedTokens,
        summary_length: summary.length 
      },
    })

    return NextResponse.json({
      success: true,
      summary,
      tags,
      chunks: chunks.length,
      tokens: estimatedTokens,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Simple text chunking function
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start += chunkSize - overlap
  }

  return chunks
}
