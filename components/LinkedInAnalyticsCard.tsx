'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LinkedInAnalyticsCard() {
  const [loading, setLoading] = useState(false)

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
