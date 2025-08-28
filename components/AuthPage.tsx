'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)

  const handleLinkedInLogin = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) throw error
      
      toast.success('Redirecting to LinkedIn...')
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect with LinkedIn')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LinkedIn Post Automation
          </h1>
          <p className="text-gray-600">
            Create, schedule, and publish LinkedIn posts with AI assistance
          </p>
        </div>

        <div className="space-y-6">
          {/* LinkedIn Login Button */}
          <button
            onClick={handleLinkedInLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Linkedin className="w-6 h-6" />
            {loading ? 'Connecting...' : 'Continue with LinkedIn'}
          </button>

          {/* Info Section */}
          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                🔐 Secure Authentication
              </h3>
              <p className="text-xs text-blue-700">
                We use LinkedIn's official OAuth to securely authenticate your account. 
                No passwords required - just your LinkedIn credentials.
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 text-center">
              What you'll get:
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>AI-powered post generation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Schedule posts for optimal timing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Direct publishing to LinkedIn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Track your posting streak</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
