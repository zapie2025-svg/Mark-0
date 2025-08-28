'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Linkedin, CheckCircle, XCircle } from 'lucide-react'

export default function LinkedInCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    handleLinkedInCallback()
  }, [])

  const handleLinkedInCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      const state = urlParams.get('state')

      if (error) {
        setStatus('error')
        setMessage(`LinkedIn connection failed: ${error}`)
        setTimeout(() => {
          window.close()
        }, 3000)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received from LinkedIn')
        setTimeout(() => {
          window.close()
        }, 3000)
        return
      }

      // Exchange code for access token
      const tokenResponse = await fetch('/api/linkedin/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state })
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const tokenData = await tokenResponse.json()
      const { access_token, profile } = tokenData

      // Store LinkedIn profile in user metadata
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            linkedin_profile: profile,
            linkedin_access_token: access_token
          }
        })

        if (updateError) {
          throw new Error('Failed to store LinkedIn profile')
        }

        setStatus('success')
        setMessage('LinkedIn connected successfully!')
        
        // Close popup and notify parent window
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'LINKEDIN_CONNECTED', profile }, '*')
          }
          window.close()
        }, 2000)
      } else {
        throw new Error('No active session')
      }

    } catch (error: any) {
      console.error('LinkedIn callback error:', error)
      setStatus('error')
      setMessage(error.message || 'Failed to connect LinkedIn')
      setTimeout(() => {
        window.close()
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to LinkedIn</h2>
              <p className="text-gray-600">Please wait while we connect your LinkedIn profile...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-green-100 rounded-full p-3 mx-auto mb-4 w-fit">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">This window will close automatically.</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-red-100 rounded-full p-3 mx-auto mb-4 w-fit">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">This window will close automatically.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
