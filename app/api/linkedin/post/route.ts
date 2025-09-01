import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { withRateLimit, rateLimiters } from '@/lib/rate-limiter'

interface LinkedInPostRequest {
  postId: string
  includeMedia?: boolean
}

export const POST = withRateLimit(rateLimiters.linkedin)(async (request: NextRequest) => {
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

    const body: LinkedInPostRequest = await request.json()
    const { postId, includeMedia = false } = body

    // Get the post from database
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Use the provided LinkedIn access token
    const linkedInAccessToken = 'AQUd8MREWtCZrJBkGQPekaz8qA0eSXZVQqWm_m82QMecWVC94hQTydsPbNTyvJSVZEBCJSOpnGfcLGRj9G2pobNJ9fIZ-E49gMZfg5OsHwzw3goeoQtFZb_vbUSNKnzSh84jUEL-fuQ2SCbR0qkq8uzHDXm7m2ILtspqW7jX4IjFb_C4jd-0obqLEBIgrgp4J_HAvLrmMlre7OUhDs2TGLuZCG8zfIiRKwgnJVDcIBOO17wUwqHy-BHSjWZpdiCuvgzuW0m4eJLzQO2Rhg83I61rm9cigCMsy3m5zgiEVV3a5mAGFtnG6CP8OVlq4UxvZNCa2rTBOjZTMrKJqqbiXR0iWkMDpA'

    // Get user's LinkedIn profile ID from userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${linkedInAccessToken}`,
      }
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ error: 'Failed to get LinkedIn profile' }, { status: 400 })
    }

    const profileData = await profileResponse.json()
    const linkedInId = profileData.sub

    // Prepare the LinkedIn post
    const linkedInPost: any = {
      author: `urn:li:person:${linkedInId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.content
          },
          shareMediaCategory: includeMedia ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    // If media is included, handle media upload
    if (includeMedia && post.media_url) {
      try {
        // Register media upload
        const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${linkedInAccessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: `urn:li:person:${linkedInId}`,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent'
                }
              ]
            }
          })
        })

        if (!registerResponse.ok) {
          throw new Error('Failed to register media upload')
        }

        const registerData = await registerResponse.json()
        const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl
        const asset = registerData.value.asset

        // Upload the media
        const mediaResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${linkedInAccessToken}`,
            'Content-Type': 'application/octet-stream'
          },
          body: await fetch(post.media_url).then(res => res.arrayBuffer())
        })

        if (!mediaResponse.ok) {
          throw new Error('Failed to upload media')
        }

        // Add media to post
        linkedInPost.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE'
        linkedInPost.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            description: {
              text: 'Post media'
            },
            media: asset,
            title: {
              text: 'Post media'
            }
          }
        ]
      } catch (mediaError) {
        console.error('Media upload error:', mediaError)
        // Continue with text-only post if media upload fails
        linkedInPost.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'NONE'
      }
    }

    // Post to LinkedIn
    const linkedInResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${linkedInAccessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(linkedInPost)
    })

    if (!linkedInResponse.ok) {
      const errorData = await linkedInResponse.text()
      console.error('LinkedIn API error:', errorData)
      return NextResponse.json({ 
        error: 'Failed to post to LinkedIn',
        details: errorData
      }, { status: 400 })
    }

    const linkedInData = await linkedInResponse.json()
    const linkedInPostId = linkedInData.id

    // Update post in database
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        linkedin_post_id: linkedInPostId,
        linkedin_posted_at: new Date().toISOString(),
        linkedin_post_status: 'published',
        status: 'published'
      })
      .eq('id', postId)

    if (updateError) {
      console.error('Database update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      linkedInPostId,
      message: 'Post published to LinkedIn successfully'
    })

  } catch (error: any) {
    console.error('LinkedIn posting error:', error)
    return NextResponse.json({
      error: 'Failed to post to LinkedIn',
      details: error.message
    }, { status: 500 })
  }
})
