import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { postId, scheduleTime } = await request.json()

    if (!postId || !scheduleTime) {
      return NextResponse.json(
        { error: 'Post ID and schedule time are required' },
        { status: 400 }
      )
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      )
    }

    // Extract the token from the header
    const token = authHeader.replace('Bearer ', '')
    
    // Create a server client with the user's token
    const supabaseClient = createServerClient(token)
    
    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the post belongs to the user
    const { data: existingPost, error: fetchError } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Update the post with schedule time and status
    const { data, error } = await supabaseClient
      .from('posts')
      .update({
        schedule_time: scheduleTime,
        status: 'scheduled',
      })
      .eq('id', postId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to schedule post' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error scheduling post:', error)
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    )
  }
}
