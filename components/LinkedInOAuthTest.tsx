'use client'

import { useState } from 'react'
import { Linkedin, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LinkedInOAuthTest() {
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const testLinkedInOAuth = async () => {
    setTesting(true)
    try {
      // Test the OAuth URL directly
      const response = await fetch('/api/test-linkedin-oauth')
      const data = await response.json()
      setTestResults(data)
      
      if (data.testUrl) {
        // Try to open the OAuth URL
        window.open(data.testUrl, '_blank')
      }
    } catch (error) {
      console.error('OAuth test error:', error)
      toast.error('Failed to test LinkedIn OAuth')
    } finally {
      setTesting(false)
    }
  }

  const tryLinkedInOAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: 'openid profile email w_member_social'
        }
      })
      
      if (error) {
        toast.error(`LinkedIn OAuth Error: ${error.message}`)
        console.error('LinkedIn OAuth error:', error)
      } else {
        toast.success('Redirecting to LinkedIn...')
      }
    } catch (error: any) {
      toast.error(`OAuth Error: ${error.message}`)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-yellow-600" />
        <h3 className="font-semibold text-gray-900">LinkedIn OAuth Debug</h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          If LinkedIn OAuth is not working, follow these steps:
        </p>
        
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-medium text-gray-900 mb-2">Step-by-Step Setup:</h4>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://www.linkedin.com/developers/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn Developers</a></li>
            <li>Create a new app called "Mark-0 LinkedIn Integration"</li>
            <li>In Auth tab, add redirect URLs:
              <ul className="ml-4 mt-1 text-xs text-gray-600">
                <li>• https://hohfixivtuqnowrdpucr.supabase.co/auth/v1/callback</li>
                <li>• https://mark-0.netlify.app/auth/callback</li>
                <li>• https://mark-0.netlify.app/dashboard</li>
              </ul>
            </li>
            <li>Copy Client ID and Client Secret</li>
            <li>Go to <a href="https://supabase.com/dashboard/project/hohfixivtuqnowrdpucr/auth/providers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Auth Providers</a></li>
            <li>Enable LinkedIn and enter your credentials</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={testLinkedInOAuth}
            disabled={testing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {testing ? 'Testing...' : 'Test OAuth Config'}
          </button>
          
          <button
            onClick={tryLinkedInOAuth}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Linkedin className="w-4 h-4" />
            Try LinkedIn OAuth
          </button>
        </div>

        {testResults && (
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-medium text-gray-900 mb-2">Test Results:</h4>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Supabase URL: {testResults.supabaseUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Supabase Key: {testResults.supabaseAnonKey}</span>
              </div>
              {testResults.testUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1">Test URL:</p>
                  <a 
                    href={testResults.testUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline break-all"
                  >
                    {testResults.testUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
