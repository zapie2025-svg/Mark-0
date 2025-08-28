'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LinkedInAnalyticsCard() {
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    checkLinkedInConnection()
    handleOAuthCallback()
  }, [])

  const checkLinkedInConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.user_metadata?.linkedin_access_token) {
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error)
    }
  }

  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const linkedinConnected = urlParams.get('linkedin_connected')
    
    if (linkedinConnected === 'true') {
      const linkedinId = urlParams.get('linkedin_id')
      const linkedinName = urlParams.get('linkedin_name')
      const linkedinPicture = urlParams.get('linkedin_picture')
      
      if (linkedinId && linkedinName) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            // Store LinkedIn credentials
            const response = await fetch('/api/linkedin/auth', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                linkedinAccessToken: session.provider_token, // This will be the LinkedIn access token
                linkedinId,
                linkedinName,
                linkedinPicture
              })
            })

            if (response.ok) {
              setIsConnected(true)
              toast.success('LinkedIn connected successfully!')
              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname)
            } else {
              toast.error('Failed to store LinkedIn credentials')
            }
          }
        } catch (error) {
          console.error('Error storing LinkedIn credentials:', error)
          toast.error('Failed to connect LinkedIn')
        }
      }
    }
  }

  const connectLinkedIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: 'openid profile email w_member_social'
        }
      })
      
      if (error) {
        toast.error('Failed to connect with LinkedIn')
      } else {
        toast.success('Redirecting to LinkedIn...')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect with LinkedIn')
    } finally {
      setLoading(false)
    }
  }

  if (isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Linkedin className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            LinkedIn Connected
          </h3>
          <p className="text-gray-600 mb-4">
            Your LinkedIn account is connected. You can now post directly to LinkedIn from this dashboard.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              ✅ Ready to post to LinkedIn
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Linkedin className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your LinkedIn Profile
        </h3>
        <p className="text-gray-600 mb-6">
          Connect your LinkedIn account to post directly to LinkedIn from this dashboard.
        </p>
        <button
          onClick={connectLinkedIn}
          disabled={loading}
          className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
        >
          <Linkedin className="w-5 h-5" />
          {loading ? 'Connecting...' : 'Connect LinkedIn'}
        </button>
      </div>
    </div>
  )
}
