import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
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

    // Update the post status to published
    const { data, error } = await supabaseClient
      .from('posts')
      .update({
        status: 'published',
      })
      .eq('id', postId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to publish post' },
        { status: 500 }
      )
    }

    // TODO: In the future, integrate with LinkedIn API here
    console.log('Post published:', data.content)

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error publishing post:', error)
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    )
  }
}
