'use client'

import { useState, useEffect } from 'react'
import { Linkedin, TrendingUp, Users, Eye, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LinkedInAnalyticsCard() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [linkedInProfile, setLinkedInProfile] = useState<any>(null)

  useEffect(() => {
    checkLinkedInConnection()
    
    // Listen for LinkedIn connection message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LINKEDIN_CONNECTED') {
        setLinkedInProfile(event.data.profile)
        setIsConnected(true)
        setShowAnalytics(true)
        toast.success('LinkedIn connected successfully!')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const checkLinkedInConnection = async () => {
    try {
      setIsChecking(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check if user has LinkedIn profile data stored
      const hasLinkedInProfile = session?.user?.user_metadata?.linkedin_profile
      console.log('Has LinkedIn profile:', !!hasLinkedInProfile)
      
      if (hasLinkedInProfile) {
        setIsConnected(true)
        setShowAnalytics(true)
        setLinkedInProfile(hasLinkedInProfile)
      } else {
        setIsConnected(false)
        setShowAnalytics(false)
      }
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error)
      setIsConnected(false)
      setShowAnalytics(false)
    } finally {
      setIsChecking(false)
    }
  }

  const connectLinkedIn = async () => {
    setLoading(true)
    try {
      // Open LinkedIn OAuth in a popup window
      const popup = window.open(
        'https://www.linkedin.com/oauth/v2/authorization?' +
        'response_type=code' +
        '&client_id=' + process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID +
        '&redirect_uri=' + encodeURIComponent(`${window.location.origin}/linkedin-callback`) +
        '&scope=' + encodeURIComponent('openid profile email w_member_social') +
        '&state=' + Math.random().toString(36).substring(7),
        'linkedin-oauth',
        'width=600,height=600'
      )

      // Listen for the callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          // Check if connection was successful
          checkLinkedInConnection()
        }
      }, 1000)

      toast.success('LinkedIn connection popup opened')
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect LinkedIn')
    } finally {
      setLoading(false)
    }
  }

  const disconnectLinkedIn = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Remove LinkedIn profile data from user metadata
        const { error } = await supabase.auth.updateUser({
          data: {
            linkedin_profile: null,
            linkedin_access_token: null
          }
        })

        if (error) {
          toast.error('Failed to disconnect LinkedIn')
        } else {
          setIsConnected(false)
          setShowAnalytics(false)
          setLinkedInProfile(null)
          toast.success('LinkedIn disconnected successfully')
        }
      }
    } catch (error: any) {
      toast.error('Failed to disconnect LinkedIn')
    }
  }

  // Show loading state while checking connection
  if (isChecking) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Checking LinkedIn connection...</span>
        </div>
      </div>
    )
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
                          <h3 className="font-semibold text-gray-900">Connect with LinkedIn</h3>
            <p className="text-sm text-gray-600">Connect your LinkedIn profile for posting</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Connect your LinkedIn account to enable direct posting and access your profile information.
          </p>
          
          <button
            onClick={connectLinkedIn}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Linkedin className="w-4 h-4" />
            {loading ? 'Connecting...' : 'Connect with LinkedIn'}
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
            <h3 className="font-semibold text-gray-900">LinkedIn Profile</h3>
            <p className="text-sm text-gray-600">Connected and ready for posting</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            Connected
          </div>
          <button
            onClick={checkLinkedInConnection}
            className="text-xs text-gray-500 hover:text-gray-700"
            title="Refresh connection status"
          >
            ↻
          </button>
        </div>
      </div>

      {/* LinkedIn Profile Info */}
      {linkedInProfile && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Your LinkedIn Profile</h4>
          <div className="flex items-center gap-3">
            {linkedInProfile.picture && (
              <img 
                src={linkedInProfile.picture} 
                alt="LinkedIn Profile" 
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{linkedInProfile.name}</p>
              <p className="text-sm text-gray-600">{linkedInProfile.headline}</p>
              <p className="text-xs text-gray-500">{linkedInProfile.location}</p>
            </div>
          </div>
        </div>
      )}

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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <button
            onClick={disconnectLinkedIn}
            className="text-xs text-red-600 hover:text-red-800"
            title="Disconnect LinkedIn"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}
