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

    // Get the scheduled post
    const { data: post, error: fetchError } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Scheduled post not found' },
        { status: 404 }
      )
    }

    // Check if user has LinkedIn connected
    const linkedInToken = user.user_metadata?.linkedin_access_token
    if (!linkedInToken) {
      return NextResponse.json(
        { error: 'LinkedIn not connected' },
        { status: 400 }
      )
    }

    // Post to LinkedIn
    const linkedInResponse = await fetch('/api/linkedin/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: post.content,
        postId: post.id
      }),
    })

    if (!linkedInResponse.ok) {
      const errorData = await linkedInResponse.json()
      console.error('LinkedIn posting error:', errorData)
      
      // Update post status to failed
      await supabaseClient
        .from('posts')
        .update({
          status: 'failed',
          error_message: errorData.error || 'Failed to post to LinkedIn'
        })
        .eq('id', postId)

      return NextResponse.json(
        { error: 'Failed to post to LinkedIn' },
        { status: 500 }
      )
    }

    // Update post status to published
    const { error: updateError } = await supabaseClient
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', postId)

    if (updateError) {
      console.error('Error updating post status:', updateError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Post published to LinkedIn successfully' 
    })

  } catch (error) {
    console.error('Error publishing scheduled post:', error)
    return NextResponse.json(
      { error: 'Failed to publish scheduled post' },
      { status: 500 }
    )
  }
}
