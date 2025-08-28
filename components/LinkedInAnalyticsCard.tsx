'use client'

import { useState, useEffect } from 'react'
import { Linkedin, TrendingUp, Users, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LinkedInAnalyticsCard() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    checkLinkedInConnection()
    handleOAuthCallback()
  }, [])

  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const provider = urlParams.get('provider')
    
    if (code && provider === 'linkedin') {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Get the provider token (LinkedIn access token)
          const linkedinAccessToken = session.provider_token
          
          if (linkedinAccessToken) {
            // Store LinkedIn credentials
            const response = await fetch('/api/linkedin/auth', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                linkedinAccessToken,
                linkedinId: session.user.user_metadata?.sub || session.user.id,
                linkedinName: session.user.user_metadata?.name || 'LinkedIn User',
                linkedinPicture: session.user.user_metadata?.picture || ''
              })
            })

            if (response.ok) {
              setIsConnected(true)
              setShowAnalytics(true)
              toast.success('LinkedIn connected successfully!')
              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname)
            } else {
              toast.error('Failed to store LinkedIn credentials')
            }
          }
        }
      } catch (error) {
        console.error('Error handling LinkedIn OAuth callback:', error)
        toast.error('Failed to connect LinkedIn')
      }
    }
  }

  const checkLinkedInConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      // Check if user has actually connected LinkedIn (has LinkedIn access token)
      if (session?.user?.user_metadata?.linkedin_access_token) {
        setIsConnected(true)
        setShowAnalytics(true)
      } else {
        setIsConnected(false)
        setShowAnalytics(false)
      }
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error)
      setIsConnected(false)
      setShowAnalytics(false)
    }
  }

  const connectLinkedIn = async () => {
    setLoading(true)
    try {
      // Use LinkedIn OAuth for real connection
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
      toast.error(error.message || 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Linkedin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Connect LinkedIn</h3>
              <p className="text-sm text-gray-600">Post directly to your LinkedIn profile</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Connect your LinkedIn account to enable direct posting and track your content performance.
          </p>
          
          <button
            onClick={connectLinkedIn}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Linkedin className="w-4 h-4" />
            {loading ? 'Connecting...' : 'Connect LinkedIn'}
          </button>
        </div>
      </div>
    )
  }

  // Show analytics when connected
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Linkedin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">LinkedIn Analytics</h3>
            <p className="text-sm text-gray-600">Your content performance</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
          Connected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Impressions</p>
              <p className="text-lg font-semibold text-gray-900">2.4K</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-lg font-semibold text-gray-900">8.2%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Followers</p>
              <p className="text-lg font-semibold text-gray-900">1.2K</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
