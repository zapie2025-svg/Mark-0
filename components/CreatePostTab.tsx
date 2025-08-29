'use client'

import { useState } from 'react'
import { Sparkles, Save, Calendar, Send, X, Linkedin } from 'lucide-react'
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

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'thoughtful', label: 'Thoughtful' },
    { value: 'humorous', label: 'Humorous' },
  ]

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

      setGeneratedPost(data.content)
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
          content: generatedPost,
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
            toast.success('Post scheduled successfully!')
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Not authenticated')
        return
      }

      // LinkedIn is connected with the provided access token
      // No additional checks needed

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
              onClick={async () => {
                // Save as draft first, then publish immediately
                try {
                  await saveAsDraft()
                  // Find the most recent draft and publish it
                  const response = await fetch('/api/posts', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  })
                  
                  if (response.ok) {
                    const posts = await response.json()
                    const latestDraft = posts.find((post: any) => post.status === 'draft')
                    if (latestDraft) {
                      await publishPost(latestDraft.id)
                    }
                  }
                } catch (error) {
                  toast.error('Failed to publish post')
                }
              }}
              disabled={saving}
              className="btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Ready to Post
            </button>

            <button
              onClick={postToLinkedIn}
              disabled={saving}
              className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
