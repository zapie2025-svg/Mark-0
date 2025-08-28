'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Save, Send, Linkedin } from 'lucide-react'
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

interface ScheduleTabProps {
  user: any
  onPostUpdated?: () => void
}

export default function ScheduleTab({ user, onPostUpdated }: ScheduleTabProps) {
  const [draftPosts, setDraftPosts] = useState<Post[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduling, setScheduling] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

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
      setDraftPosts(posts.filter(post => post.status === 'draft'))
      setScheduledPosts(posts.filter(post => post.status === 'scheduled'))
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const schedulePost = async (postId: string) => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time')
      return
    }

    const scheduleTime = new Date(`${selectedDate}T${selectedTime}`).toISOString()
    
    setScheduling(postId)
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('You must be logged in to schedule posts')
        return
      }

      const response = await fetch('/api/posts/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          postId,
          scheduleTime,
        }),
      })

      if (!response.ok) throw new Error('Failed to schedule post')

      toast.success('Post scheduled successfully!')
      setSelectedDate('')
      setSelectedTime('')
      fetchPosts()
      onPostUpdated?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule post')
    } finally {
      setScheduling(null)
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
      fetchPosts()
      onPostUpdated?.()
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

      // Check if LinkedIn is actually connected
      if (!session.user.user_metadata?.linkedin_access_token) {
        toast.error('Please connect your LinkedIn account first from the Dashboard')
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Posts</h2>
        <p className="text-gray-600">
          Schedule your draft posts for automatic publishing at specific times.
        </p>
      </div>

      {/* Draft Posts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Draft Posts</h3>
        {draftPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No draft posts available</p>
            <p className="text-sm">Create a post first to schedule it</p>
          </div>
        ) : (
          <div className="space-y-4">
            {draftPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Created: {format(new Date(post.created_at), 'MMM dd, yyyy')}
                    </p>
                    <div className="bg-white rounded border p-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {post.content}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="input-field text-sm"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  <button
                    onClick={() => schedulePost(post.id)}
                    disabled={scheduling === post.id || !selectedDate || !selectedTime}
                    className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {scheduling === post.id ? 'Scheduling...' : 'Schedule'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Posts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Posts</h3>
        {scheduledPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No scheduled posts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-start mb-4">
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
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => publishPost(post.id)}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Ready to Post
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
