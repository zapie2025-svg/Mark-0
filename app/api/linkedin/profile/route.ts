import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get LinkedIn access token from query parameters or headers
    const url = new URL(request.url)
    const accessToken = url.searchParams.get('access_token') || request.headers.get('x-linkedin-token')
    
    if (!accessToken) {
      return NextResponse.json({ error: 'LinkedIn access token required' }, { status: 400 })
    }
    
    // Fetch LinkedIn profile data using the access token
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!profileResponse.ok) {
      console.error('LinkedIn profile API error:', await profileResponse.text())
      return NextResponse.json({ error: 'Failed to fetch LinkedIn profile' }, { status: 500 })
    }

    const profileData = await profileResponse.json()

    // Fetch additional profile information from /me endpoint
    const meResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    let meData: any = {}
    if (meResponse.ok) {
      meData = await meResponse.json()
    }

    // Combine the data
    const combinedProfile = {
      firstName: profileData.given_name || profileData.firstName || '',
      lastName: profileData.family_name || profileData.lastName || '',
      profilePicture: profileData.picture || '',
      headline: meData.headline || profileData.headline || '',
      industry: meData.industry || profileData.industry || '',
      email: profileData.email || '',
      id: profileData.sub || meData.id || '',
    }

    return NextResponse.json(combinedProfile)

  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
