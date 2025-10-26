import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  file: z.string().optional(),
  source_type: z.enum(['text', 'audio', 'pdf', 'web']),
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

    // Parse form data
    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const sourceType = formData.get('source_type') as string
    const file = formData.get('file') as File | null

    // Validate input
    const validationResult = createNoteSchema.safeParse({
      title: title || undefined,
      content: content || undefined,
      source_type: sourceType || 'text',
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    let fileUrl: string | null = null

    // Handle file upload if present
    if (file && file.size > 0) {
      const fileName = `${user.id}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('File upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload file' },
          { status: 500 }
        )
      }

      fileUrl = uploadData.path
    }

    // Insert note into database
    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: title || null,
        content: content || null,
        file_url: fileUrl,
        source_type: validationResult.data.source_type,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      )
    }

    // Log event
    await supabase.from('note_events').insert({
      note_id: note.id,
      user_id: user.id,
      event_type: 'created',
      details: { source_type: validationResult.data.source_type },
    })

    // Note: AI processing is now handled via streaming on the client side
    // The client will automatically start streaming if eligible (word count <= 5000)

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

