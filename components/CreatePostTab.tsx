'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Save, Calendar, Send, X, Linkedin, Lightbulb, Copy, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface CreatePostTabProps {
  user: any
  onPostCreated?: () => void
}

export default function CreatePostTab({ user, onPostCreated }: CreatePostTabProps) {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [audience, setAudience] = useState('')
  const [goals, setGoals] = useState('')
  const [generatedPost, setGeneratedPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [addWatermark, setAddWatermark] = useState(true)

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'thoughtful', label: 'Thoughtful' },
    { value: 'humorous', label: 'Humorous' },
  ]

  const generateRecommendations = async () => {
    setLoadingRecommendations(true)
    try {
      // Prepare user information for the new recommendation system
      const userInfo = {
        role: user.user_metadata?.headline || user.user_metadata?.role || 'Professional',
        industry: user.user_metadata?.industry || 'Professional Services',
        experience_years: user.user_metadata?.experience || '3-5 years',
        goal: user.user_metadata?.goal || 'Personal Branding',
        content_style: user.user_metadata?.content_style || 'Tips & Insights',
        linkedin_profile: {
          headline: user.user_metadata?.headline || '',
          about: user.user_metadata?.about || '',
          skills: user.user_metadata?.skills || [],
          recent_posts: user.user_metadata?.recent_posts || []
        },
        useSurveyData: user.user_metadata?.survey_completed || false
      }

      // Generate recommendations using the new improved system
      const response = await fetch('/api/posts/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      })

      if (!response.ok) {
        throw new Error('Failed to generate recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
      setShowRecommendations(true)
      toast.success('Recommendations generated!')

    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error('Failed to generate recommendations')
    } finally {
      setLoadingRecommendations(false)
    }
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

  const addWatermarkToContent = (content: string): string => {
    if (!addWatermark) return content
    
    // Add watermark at the end of the content
    const watermark = '\n\nPosted by Mark-0'
    return content + watermark
  }

  const removeWatermarkFromContent = (content: string): string => {
    // Remove watermark if it exists
    return content.replace(/\n\nPosted by Mark-0$/, '')
  }

  // Update content when watermark setting changes
  useEffect(() => {
    if (generatedPost) {
      const contentWithoutWatermark = removeWatermarkFromContent(generatedPost)
      if (addWatermark) {
        setGeneratedPost(addWatermarkToContent(contentWithoutWatermark))
      } else {
        setGeneratedPost(contentWithoutWatermark)
      }
    }
  }, [addWatermark])

  const useRecommendation = (title: string, hashtags: string[]) => {
    setTopic(title)
    const content = `${title}\n\n${hashtags.join(' ')}`
    setGeneratedPost(addWatermarkToContent(content))
    setShowRecommendations(false)
    toast.success('Topic applied to post generator!')
  }

  const generatePost = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, tone, audience, goals }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate post')
      }

      // Apply watermark to generated content
      const contentWithWatermark = addWatermarkToContent(data.content)
      setGeneratedPost(contentWithWatermark)
      toast.success('Post generated successfully!')
    } catch (error: any) {
      console.error('Generate post error:', error)
      toast.error(error.message || 'Failed to generate post')
    } finally {
      setLoading(false)
    }
  }

  const saveAsDraft = async () => {
    if (!generatedPost.trim()) {
      toast.error('No post content to save')
      return
    }

    setSaving(true)
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('You must be logged in to save posts')
        return
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: generatedPost, // Content already has watermark if enabled
          status: 'draft',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      toast.success('Draft saved successfully!')
      setGeneratedPost('')
      setTopic('')
      setAudience('')
      setGoals('')
      onPostCreated?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const publishPost = async (postId: string) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('You must be logged in to publish posts')
        return
      }

      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish post')
      }

      toast.success('Post published successfully!')
      setGeneratedPost('')
      setTopic('')
      setAudience('')
      setGoals('')
      onPostCreated?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish post')
    }
  }

  const schedulePost = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time')
      return
    }

    // Check if LinkedIn is connected
    if (!user.user_metadata?.linkedin_access_token) {
      toast.error('Please connect your LinkedIn account first to schedule posts')
      return
    }

    const scheduleTime = new Date(`${selectedDate}T${selectedTime}`).toISOString()
    
    setScheduling(true)
    try {
      // First save as draft
      await saveAsDraft()
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('You must be logged in to schedule posts')
        return
      }

      // Find the most recent draft and schedule it
      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (response.ok) {
        const posts = await response.json()
        const latestDraft = posts.find((post: any) => post.status === 'draft')
        
        if (latestDraft) {
          const scheduleResponse = await fetch('/api/posts/schedule', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              postId: latestDraft.id,
              scheduleTime,
            }),
          })

          if (scheduleResponse.ok) {
            toast.success('Post scheduled successfully! It will be published to LinkedIn at the scheduled time.')
            setShowScheduleModal(false)
            setSelectedDate('')
            setSelectedTime('')
            setGeneratedPost('')
            setTopic('')
            setAudience('')
            setGoals('')
            onPostCreated?.()
          } else {
            throw new Error('Failed to schedule post')
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule post')
    } finally {
      setScheduling(false)
    }
  }

  const postToLinkedIn = async () => {
    try {
      // Check if LinkedIn is connected
      if (!user.user_metadata?.linkedin_access_token) {
        toast.error('Please connect your LinkedIn account first')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Not authenticated')
        return
      }

      // First save as draft
      await saveAsDraft()
      
      // Find the most recent draft and post to LinkedIn
      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (response.ok) {
        const posts = await response.json()
        const latestDraft = posts.find((post: any) => post.status === 'draft')
        
        if (latestDraft) {
          const linkedInResponse = await fetch('/api/linkedin/post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ postId: latestDraft.id, includeMedia: false })
          })

          if (linkedInResponse.ok) {
            const result = await linkedInResponse.json()
            toast.success('Post published to LinkedIn successfully!')
            setGeneratedPost('')
            setTopic('')
            setAudience('')
            setGoals('')
            onPostCreated?.()
          } else {
            const error = await linkedInResponse.json()
            toast.error(error.error || 'Failed to post to LinkedIn')
          }
        }
      }
    } catch (error) {
      toast.error('Failed to post to LinkedIn')
    }
  }



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Post</h2>
        <p className="text-gray-600">
          Generate LinkedIn posts with AI assistance based on your topic and preferred tone.
        </p>
      </div>

      {/* AI-Powered Topic Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Topic Recommendations</h3>
          </div>
          <button
            onClick={generateRecommendations}
            disabled={loadingRecommendations}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            {loadingRecommendations ? 'Generating...' : 'Get Recommendations'}
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Get 10 personalized topic suggestions based on your role, industry, goals, and content preferences to inspire your next LinkedIn post.
        </p>

        {showRecommendations && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{recommendation.title}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => useRecommendation(recommendation.title, recommendation.hashtags)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => copyToClipboard(recommendation.title, recommendation.hashtags, recommendation.id)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {copiedId === recommendation.id ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {recommendation.format}
                    </span>
                    {recommendation.angle && (
                      <span className="text-gray-600 text-xs">
                        {recommendation.angle}
                      </span>
                    )}
                  </div>
                </div>
                
                {recommendation.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recommendation.hashtags.map((hashtag: string, index: number) => (
                      <span
                        key={index}
                        className="px-1 py-0.5 bg-gray-200 text-gray-700 rounded text-xs"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your post topic (e.g., 'AI in business', 'Remote work tips', 'Industry insights')"
              className="input-field h-32 resize-none"
            />
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="input-field"
            >
              {tones.map((toneOption) => (
                <option key={toneOption.value} value={toneOption.value}>
                  {toneOption.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience (Optional)
            </label>
            <input
              id="audience"
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., 'Tech professionals', 'Small business owners', 'Marketing managers'"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">
              Content Goals (Optional)
            </label>
            <input
              id="goals"
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g., 'Thought leadership', 'Lead generation', 'Brand awareness'"
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <input
              id="watermark"
              type="checkbox"
              checked={addWatermark}
              onChange={(e) => setAddWatermark(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="watermark" className="text-sm font-medium text-blue-900">
              Add "Posted by Mark-0" watermark to generated content
            </label>
          </div>

          <button
            onClick={generatePost}
            disabled={loading || !topic.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            {loading ? 'Generating...' : 'Generate Post'}
          </button>
        </div>

        {/* Generated Post */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generated Post
          </label>
          <div className="relative">
            <textarea
              value={generatedPost}
              onChange={(e) => setGeneratedPost(e.target.value)}
              placeholder="Your generated post will appear here..."
              className="input-field h-64 resize-none"
              readOnly={!generatedPost}
            />
            {generatedPost && (
              <div className="absolute top-2 right-2">
                <button
                  onClick={saveAsDraft}
                  disabled={saving}
                  className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {generatedPost && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Preview</h3>
          <div className="bg-white rounded border p-4 text-sm text-gray-700 whitespace-pre-wrap mb-4">
            {generatedPost}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={saveAsDraft}
              disabled={saving}
              className="btn-secondary flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            
            <button
              onClick={() => setShowScheduleModal(true)}
              disabled={saving}
              className="btn-secondary flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              Schedule Post
            </button>
            
            <button
              onClick={postToLinkedIn}
              disabled={saving}
              className="btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Linkedin className="w-4 h-4" />
              Post to LinkedIn
            </button>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Post</h3>
              <button
                onClick={() => {
                  setShowScheduleModal(false)
                  setSelectedDate('')
                  setSelectedTime('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">Post Preview:</p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {generatedPost}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={schedulePost}
                disabled={scheduling || !selectedDate || !selectedTime}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                {scheduling ? 'Scheduling...' : 'Schedule Post'}
              </button>
              <button
                onClick={() => {
                  setShowScheduleModal(false)
                  setSelectedDate('')
                  setSelectedTime('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
