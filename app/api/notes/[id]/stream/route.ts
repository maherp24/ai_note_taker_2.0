import { NextRequest } from 'next/server'
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

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
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
      return new Response(
        JSON.stringify({ error: 'Note not found' }),
        { status: 404 }
      )
    }

    const textToProcess = note.content || ''

    if (!textToProcess || textToProcess.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Insufficient content to process' }),
        { status: 400 }
      )
    }

    // Check word count - don't process if over 5000 words
    const wordCount = textToProcess.split(/\s+/).length
    if (wordCount > 5000) {
      return new Response(
        JSON.stringify({ 
          error: 'Note exceeds 5,000 word limit',
          wordCount 
        }),
        { status: 400 }
      )
    }

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Generating summary...' })}\n\n`)
          )

          let fullSummary = ''
          
          // Generate streaming summary
          const summaryStream = await openai.chat.completions.create({
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
            stream: true,
          })

          // Stream the summary
          for await (const chunk of summaryStream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullSummary += content
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'summary', content })}\n\n`)
              )
            }
          }

          // Send status for tags
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Generating tags...' })}\n\n`)
          )

          // Generate tags (non-streaming)
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
            try {
              const parsedTags = JSON.parse(tagsContent)
              if (Array.isArray(parsedTags)) {
                tags = parsedTags.slice(0, 5).map((tag: string) => tag.toLowerCase())
              }
            } catch {
              const matches = tagsContent.match(/"([^"]+)"/g)
              if (matches) {
                tags = matches.map(m => m.replace(/"/g, '').toLowerCase()).slice(0, 5)
              }
            }
            
            if (tags.length === 0) {
              tags = ['general', 'note']
            }
          } catch (error) {
            console.error('Tags generation error:', error)
            tags = ['general', 'note']
          }

          // Send tags
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'tags', tags })}\n\n`)
          )

          // Generate embeddings in background (don't stream this)
          const chunks = chunkText(textToProcess, 1000, 150)
          
          // Send status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Creating embeddings...' })}\n\n`)
          )

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
          }

          // Calculate tokens
          const estimatedTokens = Math.ceil(textToProcess.length / 4)

          // Update note with AI data
          await supabase
            .from('notes')
            .update({
              summary: fullSummary,
              tags,
              tokens: estimatedTokens,
            })
            .eq('id', note.id)

          // Log event
          await supabase.from('note_events').insert({
            note_id: note.id,
            user_id: user.id,
            event_type: 'summarized',
            details: { 
              chunks: chunks.length, 
              tags,
              tokens: estimatedTokens,
              summary_length: fullSummary.length,
              streaming: true,
            },
          })

          // Send completion
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', summary: fullSummary, tags, tokens: estimatedTokens })}\n\n`)
          )

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'AI processing failed' })}\n\n`)
          )
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

