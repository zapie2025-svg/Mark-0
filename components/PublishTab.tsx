'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle, Clock } from 'lucide-react'
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

      if (!response.ok) throw new Error('Failed to publish post')

      toast.success('Post published successfully!')
      fetchPosts()
      onPostUpdated?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish post')
    } finally {
      setPublishing(null)
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
                    <button
                      onClick={() => publishPost(post.id)}
                      disabled={publishing === post.id}
                      className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 ml-4"
                    >
                      <Send className="w-4 h-4" />
                      {publishing === post.id ? 'Publishing...' : 'Publish Now'}
                    </button>
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
                      onClick={() => publishPost(post.id)}
                      disabled={publishing === post.id}
                      className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50 ml-4"
                    >
                      <Send className="w-4 h-4" />
                      {publishing === post.id ? 'Publishing...' : 'Publish Early'}
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
    </div>
  )
}
