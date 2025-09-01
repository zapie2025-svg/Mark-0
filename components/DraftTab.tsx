'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Edit, Calendar, Send, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface DraftTabProps {
  user: any
  onPostUpdated?: () => void
}

interface Post {
  id: string
  content: string
  status: 'draft' | 'scheduled' | 'published'
  created_at: string
  schedule_time?: string
}

export default function DraftTab({ user, onPostUpdated }: DraftTabProps) {
  const [drafts, setDrafts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [schedulingPost, setSchedulingPost] = useState<string | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDrafts(data || [])
    } catch (error: any) {
      toast.error('Failed to load drafts')
    } finally {
      setLoading(false)
    }
  }

  const schedulePost = async (postId: string) => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time')
      return
    }

    const scheduleDateTime = `${selectedDate}T${selectedTime}`
    
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
          scheduleTime: scheduleDateTime,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule post')
      }

      toast.success('Post scheduled successfully!')
      setShowScheduleModal(false)
      setSchedulingPost(null)
      setSelectedDate('')
      setSelectedTime('')
      fetchDrafts()
      onPostUpdated?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule post')
    }
  }

  const publishPost = async (postId: string) => {
    try {
      // Check if LinkedIn is connected
      if (!user.user_metadata?.linkedin_access_token) {
        toast.error('Please connect your LinkedIn account first')
        return
      }

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('You must be logged in to publish posts')
        return
      }

      // Post directly to LinkedIn
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          postId,
          includeMedia: false 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post to LinkedIn')
      }

      toast.success('Post published to LinkedIn successfully!')
      fetchDrafts()
      onPostUpdated?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to post to LinkedIn')
    }
  }

  const deleteDraft = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Draft deleted successfully!')
      fetchDrafts()
      onPostUpdated?.()
    } catch (error: any) {
      toast.error('Failed to delete draft')
    }
  }

  const openScheduleModal = (postId: string) => {
    setSchedulingPost(postId)
    setShowScheduleModal(true)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading drafts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Draft Posts</h2>
        <p className="text-gray-600">
          Manage your draft posts. Edit, schedule, or publish them when ready.
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12">
          <Edit className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
          <p className="text-gray-600">Create your first post to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Draft</span>
                    <span className="text-xs text-gray-500">
                      Created {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-900 whitespace-pre-wrap">{draft.content}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openScheduleModal(draft.id)}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule
                </button>
                <button
                  onClick={() => publishPost(draft.id)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  Post in LinkedIn
                </button>
                <button
                  onClick={() => deleteDraft(draft.id)}
                  className="btn-secondary flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Post</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowScheduleModal(false)
                  setSchedulingPost(null)
                  setSelectedDate('')
                  setSelectedTime('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => schedulingPost && schedulePost(schedulingPost)}
                disabled={!selectedDate || !selectedTime}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
