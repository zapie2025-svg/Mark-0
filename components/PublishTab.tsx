'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle, Clock, Linkedin, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface Post {
  id: string
  content: string
  status: 'draft' | 'scheduled' | 'published'
  schedule_time: string | null
  created_at: string
}

interface PublishTabProps {
  user: any
  onPostUpdated?: () => void
}

export default function PublishTab({ user, onPostUpdated }: PublishTabProps) {
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([])
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [showLinkedInModal, setShowLinkedInModal] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('You must be logged in to fetch posts')
        return
      }

      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch posts')
      
      const posts: Post[] = await response.json()
      setScheduledPosts(posts.filter(post => post.status === 'scheduled'))
      setPublishedPosts(posts.filter(post => post.status === 'published'))
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const publishPost = async (postId: string) => {
    setPublishing(postId)
    try {
      // Check if LinkedIn is connected
      if (!user.user_metadata?.linkedin_access_token) {
        toast.error('Please connect your LinkedIn account first')
        setPublishing(null)
        return
      }

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('You must be logged in to publish posts')
        setPublishing(null)
        return
      }

      // Post directly to LinkedIn
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ postId, includeMedia: false }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post to LinkedIn')
      }

      toast.success('Post published to LinkedIn successfully!')
      fetchPosts()
      onPostUpdated?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to post to LinkedIn')
    } finally {
      setPublishing(null)
    }
  }

  const handlePublishEarly = async (postId: string) => {
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

      // Post directly to LinkedIn
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
        fetchPosts()
        onPostUpdated?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to post to LinkedIn')
      }
    } catch (error) {
      toast.error('Failed to post to LinkedIn')
    }
  }

  const connectLinkedIn = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Not authenticated')
        return
      }

      // Check if LinkedIn is connected
      if (!session.user.user_metadata?.avatar_url) {
        toast.error('Please connect your LinkedIn account first from the Dashboard')
        return
      }

      // LinkedIn is connected with the provided access token
      // No additional checks needed
      
      // Close modal
      setShowLinkedInModal(false)
      
      if (selectedPostId) {
        // Post to LinkedIn
        const response = await fetch('/api/linkedin/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ postId: selectedPostId, includeMedia: false })
        })

        if (response.ok) {
          const result = await response.json()
          toast.success('Post published to LinkedIn successfully!')
          fetchPosts()
          onPostUpdated?.()
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to post to LinkedIn')
        }
      }
      
      setSelectedPostId(null)
    } catch (error: any) {
      toast.error('Failed to post to LinkedIn')
    }
  }

  const postToLinkedIn = async (postId: string) => {
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
        fetchPosts()
        onPostUpdated?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to post to LinkedIn')
      }
    } catch (error) {
      toast.error('Failed to post to LinkedIn')
    }
  }

  const isPostReadyToPublish = (post: Post) => {
    if (!post.schedule_time) return false
    const scheduleTime = new Date(post.schedule_time)
    const now = new Date()
    return scheduleTime <= now
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Publish Posts</h2>
        <p className="text-gray-600">
          Publish your scheduled posts or publish them immediately.
        </p>
      </div>

      {/* Scheduled Posts Ready to Publish */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Publish</h3>
        {scheduledPosts.filter(isPostReadyToPublish).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No posts ready to publish</p>
            <p className="text-sm">Posts will appear here when their scheduled time arrives</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledPosts
              .filter(isPostReadyToPublish)
              .map((post) => (
                <div key={post.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          Ready to publish (was scheduled for: {format(new Date(post.schedule_time!), 'MMM dd, yyyy HH:mm')})
                        </span>
                      </div>
                      <div className="bg-white rounded border p-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {post.content}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => publishPost(post.id)}
                        disabled={publishing === post.id}
                        className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                      >
                        <Linkedin className="w-4 h-4" />
                        {publishing === post.id ? 'Publishing...' : 'Post in LinkedIn'}
                      </button>
                      <button
                        onClick={() => postToLinkedIn(post.id)}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm"
                      >
                        <Linkedin className="w-4 h-4" />
                        Post to LinkedIn
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Future Scheduled Posts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Future Scheduled Posts</h3>
        {scheduledPosts.filter(post => !isPostReadyToPublish(post)).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No future scheduled posts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledPosts
              .filter(post => !isPostReadyToPublish(post))
              .map((post) => (
                <div key={post.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Scheduled for: {format(new Date(post.schedule_time!), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="bg-white rounded border p-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {post.content}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePublishEarly(post.id)}
                      disabled={publishing === post.id}
                      className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50 ml-4"
                    >
                      <Linkedin className="w-4 h-4" />
                      {publishing === post.id ? 'Publishing...' : 'Post in LinkedIn'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Published Posts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Published Posts</h3>
        {publishedPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No published posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {publishedPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Published on: {format(new Date(post.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="bg-white rounded border p-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {post.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LinkedIn Connection Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Connect with LinkedIn</h3>
              <button
                onClick={() => {
                  setShowLinkedInModal(false)
                  setSelectedPostId(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Linkedin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Start Publishing to LinkedIn
              </h4>
              <p className="text-gray-600 text-sm">
                Connect your LinkedIn account to start publishing posts directly to your profile.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={connectLinkedIn}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Linkedin className="w-5 h-5" />
                Connect LinkedIn Account
              </button>
              <button
                onClick={() => {
                  setShowLinkedInModal(false)
                  setSelectedPostId(null)
                }}
                className="w-full btn-secondary"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> This will open LinkedIn's OAuth flow to securely connect your account. 
                You'll be able to publish posts directly to your LinkedIn profile.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
