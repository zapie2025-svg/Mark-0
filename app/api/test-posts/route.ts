import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        error: 'Authorization header missing',
        status: 'no_auth_header'
      }, { status: 401 })
    }

    // Extract the token from the header
    const token = authHeader.replace('Bearer ', '')
    
    // Create a server client with the user's token
    const supabaseClient = createServerClient(token)
    
    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        authError: authError?.message,
        status: 'auth_failed'
      }, { status: 401 })
    }

    // Test database connection
    const { data, error } = await supabaseClient
      .from('posts')
      .select('count')
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({
        error: 'Database error',
        dbError: error.message,
        status: 'db_error'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      postCount: data?.length || 0,
      status: 'working'
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      details: error.message,
      status: 'exception'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, status = 'draft' } = await request.json()

    if (!content) {
      return NextResponse.json({
        error: 'Content is required',
        status: 'no_content'
      }, { status: 400 })
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        error: 'Authorization header missing',
        status: 'no_auth_header'
      }, { status: 401 })
    }

    // Extract the token from the header
    const token = authHeader.replace('Bearer ', '')
    
    // Create a server client with the user's token
    const supabaseClient = createServerClient(token)
    
    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        authError: authError?.message,
        status: 'auth_failed'
      }, { status: 401 })
    }

    // Test creating a post
    const { data, error } = await supabaseClient
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        status,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        error: 'Failed to create post',
        dbError: error.message,
        status: 'db_error'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      post: data,
      status: 'created'
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      details: error.message,
      status: 'exception'
    }, { status: 500 })
  }
}
