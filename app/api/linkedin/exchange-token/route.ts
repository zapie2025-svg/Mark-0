import { NextRequest, NextResponse } from 'next/server'

interface TokenExchangeRequest {
  code: string
  state: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenExchangeRequest = await request.json()
    const { code, state } = body

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
    }

    // LinkedIn OAuth configuration
    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mark-0.netlify.app'}/linkedin-callback`

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'LinkedIn OAuth not configured' }, { status: 500 })
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('LinkedIn token exchange error:', errorData)
      return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData

    // Get user profile information
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      }
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch LinkedIn profile' }, { status: 400 })
    }

    const profileData = await profileResponse.json()

    // Get additional profile information
    const additionalProfileResponse = await fetch(`https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline,location)`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    let additionalProfileData: any = {}
    if (additionalProfileResponse.ok) {
      additionalProfileData = await additionalProfileResponse.json()
    }

    // Combine profile data
    const profile = {
      id: profileData.sub,
      name: `${profileData.given_name} ${profileData.family_name}`,
      email: profileData.email,
      picture: profileData.picture,
      headline: additionalProfileData.headline || '',
      location: additionalProfileData.location?.name || '',
      access_token: access_token
    }

    return NextResponse.json({
      success: true,
      access_token,
      profile
    })

  } catch (error: any) {
    console.error('LinkedIn token exchange error:', error)
    return NextResponse.json({
      error: 'Failed to exchange LinkedIn token',
      details: error.message
    }, { status: 500 })
  }
}
