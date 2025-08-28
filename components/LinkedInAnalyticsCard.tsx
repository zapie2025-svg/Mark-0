'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Linkedin, TrendingUp, Users, Eye, MessageCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  headline: string
  profilePicture: string
  email: string
}

interface LinkedInAnalytics {
  followers: number
  impressions: number
  engagement: number
  profileViews: number
  followersChange: number
  impressionsChange: number
  engagementChange: number
  profileViewsChange: number
}

export default function LinkedInAnalyticsCard() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<LinkedInProfile | null>(null)
  const [analytics, setAnalytics] = useState<LinkedInAnalytics | null>(null)

  useEffect(() => {
    checkLinkedInConnection()
  }, [])

  const checkLinkedInConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.provider_token) {
        setIsConnected(true)
        // For now, use mock data until LinkedIn API is connected
        setProfile({
          id: '1',
          firstName: 'Yeswanth',
          lastName: 'choudari',
          headline: 'Associate product manager @bosswallah',
          profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          email: session.user.email || ''
        })
        
        setAnalytics({
          followers: 200,
          impressions: 120,
          engagement: 12,
          profileViews: 490,
          followersChange: 12,
          impressionsChange: 12,
          engagementChange: 12,
          profileViewsChange: 12
        })
      }
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectLinkedIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
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
            Connect your LinkedIn account to view your profile analytics and track your post performance.
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Profile Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={profile?.profilePicture} 
            alt="Profile" 
            className="w-12 h-12 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {profile?.firstName} {profile?.lastName}
              </h3>
              <Linkedin className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">{profile?.headline}</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          Active
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Followers</span>
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+{analytics?.followersChange}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics?.followers}</div>
          <div className="text-xs text-gray-500">Past 30 days</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Impressions</span>
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+{analytics?.impressionsChange}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics?.impressions}</div>
          <div className="text-xs text-gray-500">Past 30 days</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Engagement</span>
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+{analytics?.engagementChange}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics?.engagement}</div>
          <div className="text-xs text-gray-500">Past 30 days</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Profile Views</span>
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+{analytics?.profileViewsChange}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics?.profileViews}</div>
          <div className="text-xs text-gray-500">Past 30 days</div>
        </div>
      </div>

      {/* View Full Analytics Link */}
      <div className="mt-4 text-center">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mx-auto">
          <ExternalLink className="w-4 h-4" />
          View Full Analytics
        </button>
      </div>
    </div>
  )
}
