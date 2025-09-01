'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Briefcase, Target, Sparkles, Copy, CheckCircle, Loader2, Users, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileAnalysisTabProps {
  user: any
}

interface LinkedInProfile {
  firstName: string
  lastName: string
  profilePicture: string
  headline: string
  industry?: string
}

interface PostRecommendation {
  id: string
  title: string
  description?: string
  format?: string
  angle?: string
  type?: 'thought-leadership' | 'networking' | 'industry-insight' | 'personal-brand' | 'ai-generated'
  hashtags: string[]
}

export default function ProfileAnalysisTab({ user }: ProfileAnalysisTabProps) {
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null)
  const [recommendations, setRecommendations] = useState<PostRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchLinkedInProfile()
  }, [])

  const fetchLinkedInProfile = async () => {
    try {
      setLoading(true)
      
      // First try to get LinkedIn profile data
      const linkedInToken = user.user_metadata?.linkedin_access_token
      
      if (linkedInToken) {
        try {
          // Fetch LinkedIn profile data
          const response = await fetch(`/api/linkedin/profile?access_token=${encodeURIComponent(linkedInToken)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const profileData = await response.json()
            setLinkedInProfile(profileData)
            await generateRecommendations(profileData)
            return
          }
        } catch (linkedInError) {
          console.log('LinkedIn profile fetch failed, using fallback:', linkedInError)
        }
      }

      // Fallback to basic user information if LinkedIn is not connected or fails
      const userInfo = {
        firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || 'Professional',
        lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        profilePicture: user.user_metadata?.avatar_url || '',
        headline: user.user_metadata?.headline || 'Professional',
        industry: user.user_metadata?.industry || 'Professional Services'
      }

      setLinkedInProfile(userInfo)
      await generateRecommendations(userInfo)

    } catch (error) {
      console.error('Error loading user profile:', error)
      toast.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = async (profile: LinkedInProfile) => {
    // Coming soon - no recommendations for now
    setGeneratingRecommendations(false)
  }

  const copyToClipboard = async (title: string, hashtags: string[], id: string) => {
    try {
      const content = `${title}\n\n${hashtags.join(' ')}`
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      toast.success('Topic copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getRecommendationTypeIcon = (type?: string) => {
    switch (type) {
      case 'thought-leadership':
        return <Sparkles className="w-4 h-4 text-purple-600" />
      case 'networking':
        return <User className="w-4 h-4 text-blue-600" />
      case 'industry-insight':
        return <Briefcase className="w-4 h-4 text-green-600" />
      case 'personal-brand':
        return <Target className="w-4 h-4 text-orange-600" />
      case 'ai-generated':
        return <Sparkles className="w-4 h-4 text-indigo-600" />
      default:
        return <Sparkles className="w-4 h-4 text-gray-600" />
    }
  }

  const getRecommendationTypeLabel = (type?: string) => {
    switch (type) {
      case 'thought-leadership':
        return 'Thought Leadership'
      case 'networking':
        return 'Networking'
      case 'industry-insight':
        return 'Industry Insight'
      case 'personal-brand':
        return 'Personal Brand'
      case 'ai-generated':
        return 'AI Recommendation'
      default:
        return 'Recommendation'
    }
  }

  const getRecommendationTypeColor = (type?: string) => {
    switch (type) {
      case 'thought-leadership':
        return 'bg-purple-50 border-purple-200'
      case 'networking':
        return 'bg-blue-50 border-blue-200'
      case 'industry-insight':
        return 'bg-green-50 border-green-200'
      case 'personal-brand':
        return 'bg-orange-50 border-orange-200'
      case 'ai-generated':
        return 'bg-indigo-50 border-indigo-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your LinkedIn profile...</p>
        </div>
      </div>
    )
  }

  if (!linkedInProfile) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Information</h3>
          <p className="text-gray-600 mb-4">
            Loading your profile information and generating recommendations...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Analysis</h2>
        <p className="text-gray-600">
          AI-powered insights and recommendations based on your {user.user_metadata?.linkedin_access_token ? 'LinkedIn' : 'professional'} profile.
        </p>
      </div>

      {/* LinkedIn Profile Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-4">
          {linkedInProfile.profilePicture ? (
            <img
              src={linkedInProfile.profilePicture}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {linkedInProfile.firstName} {linkedInProfile.lastName}
            </h3>
            <p className="text-gray-600 mb-2">{linkedInProfile.headline}</p>
            {linkedInProfile.industry && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{linkedInProfile.industry}</span>
              </div>
            )}
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            user.user_metadata?.linkedin_access_token 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            <CheckCircle className="w-4 h-4" />
            {user.user_metadata?.linkedin_access_token ? 'LinkedIn Connected' : 'Profile Loaded'}
          </div>
        </div>
      </div>

      {/* AI Recommendations Section - Coming Soon */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">AI-Powered Topic Recommendations</h3>
            <p className="text-gray-600">
              Personalized post topics based on your profile and industry
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">AI-Powered Topic Recommendations</p>
          <p className="text-sm text-gray-500">Coming Soon</p>
        </div>
      </div>

      {/* Profile Insights Section - Coming Soon */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Insights</h3>
            <p className="text-gray-600">
              Deep analysis of your LinkedIn profile and content performance
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Profile Insights & Analytics</p>
          <p className="text-sm text-gray-500">Coming Soon</p>
        </div>
      </div>

      {/* Profile Insights */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Content Strategy</span>
            </div>
            <p className="text-sm text-blue-800">
              Based on your {linkedInProfile.headline.toLowerCase()}, focus on sharing industry insights and thought leadership content.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Target Audience</span>
            </div>
            <p className="text-sm text-green-800">
              Your network likely includes professionals in your industry. Tailor content to their interests and challenges.
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Posting Frequency</span>
            </div>
            <p className="text-sm text-purple-800">
              Aim for 2-3 posts per week to maintain consistent engagement without overwhelming your network.
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Growth Opportunity</span>
            </div>
            <p className="text-sm text-orange-800">
              Your profile shows potential for thought leadership. Share unique perspectives and industry trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
