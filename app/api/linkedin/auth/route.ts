import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.json({ error: 'LinkedIn authorization failed' }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 })
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/linkedin/auth`,
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('LinkedIn token exchange error:', errorData)
      return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Get user profile from LinkedIn
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      }
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ error: 'Failed to get LinkedIn profile' }, { status: 400 })
    }

    const profileData = await profileResponse.json()
    const { sub: linkedinId, name, given_name, family_name, picture, email } = profileData

    // Get user from state parameter (we'll need to implement state management)
    // For now, we'll redirect to dashboard and let the frontend handle the token storage
    const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL!)
    redirectUrl.searchParams.set('linkedin_connected', 'true')
    redirectUrl.searchParams.set('linkedin_id', linkedinId)
    redirectUrl.searchParams.set('linkedin_name', name)
    redirectUrl.searchParams.set('linkedin_picture', picture)

    return NextResponse.redirect(redirectUrl.toString())

  } catch (error: any) {
    console.error('LinkedIn auth error:', error)
    return NextResponse.json({
      error: 'LinkedIn authentication failed',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const accessToken = authHeader.replace('Bearer ', '')
    const supabase = createServerClient(accessToken)

    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { linkedinAccessToken, linkedinId, linkedinName, linkedinPicture } = body

    if (!linkedinAccessToken) {
      return NextResponse.json({ error: 'LinkedIn access token is required' }, { status: 400 })
    }

    // Update user metadata with LinkedIn credentials
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        linkedin_access_token: linkedinAccessToken,
        linkedin_id: linkedinId,
        linkedin_name: linkedinName,
        linkedin_picture: linkedinPicture
      }
    })

    if (updateError) {
      console.error('Error updating user metadata:', updateError)
      return NextResponse.json({ error: 'Failed to store LinkedIn credentials' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'LinkedIn credentials stored successfully'
    })

  } catch (error: any) {
    console.error('LinkedIn auth error:', error)
    return NextResponse.json({
      error: 'Failed to store LinkedIn credentials',
      details: error.message
    }, { status: 500 })
  }
}
