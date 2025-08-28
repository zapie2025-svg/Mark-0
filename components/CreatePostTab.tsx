'use client'

import { useState } from 'react'
import { Sparkles, Save, Calendar, Send, Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface CreatePostTabProps {
  user: any
  onPostCreated?: () => void
}

export default function CreatePostTab({ user, onPostCreated }: CreatePostTabProps) {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [generatedPost, setGeneratedPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

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
        body: JSON.stringify({ topic, tone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate post')
      }

      setGeneratedPost(data.content)
      
      if (data.note) {
        toast.success(`Post generated successfully! (${data.note})`)
      } else {
        toast.success('Post generated successfully!')
      }
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
      onPostCreated?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish post')
    }
  }

  const postToLinkedIn = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Not authenticated')
        return
      }

      // Check if LinkedIn is connected
      if (!session.user.user_metadata?.linkedin_access_token) {
        toast.error('Please connect your LinkedIn account first')
        return
      }

      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ postId, includeMedia: false })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Post published to LinkedIn successfully!')
        setGeneratedPost('')
        setTopic('')
        onPostCreated?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to post to LinkedIn')
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
              onClick={() => {
                // Save as draft first, then open scheduling
                saveAsDraft().then(() => {
                  // After saving, we could redirect to schedule tab or show scheduling modal
                  toast.success('Draft saved! You can now schedule it from the Draft tab.')
                })
              }}
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
              onClick={async () => {
                // Save as draft first, then post to LinkedIn
                try {
                  await saveAsDraft()
                  // Find the most recent draft and post to LinkedIn
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
                      await postToLinkedIn(latestDraft.id)
                    }
                  }
                } catch (error) {
                  toast.error('Failed to post to LinkedIn')
                }
              }}
              disabled={saving}
              className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <Linkedin className="w-4 h-4" />
              Post to LinkedIn
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
