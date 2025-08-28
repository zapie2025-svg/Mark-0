'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Password validation
  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return null
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate password for signup
      if (isSignUp) {
        const passwordError = validatePassword(password)
        if (passwordError) {
          setError(passwordError)
          setLoading(false)
          return
        }
      }

      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        })
        
        if (error) {
          console.error('Signup error:', error)
          if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the verification link to complete signup.')
          } else if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please sign in instead.')
          } else {
            setError(error.message)
          }
        } else if (data.user && !data.session) {
          // Email confirmation required
          toast.success('Account created! Please check your email to verify your account.')
          setError('Please check your email and click the verification link to complete signup.')
        } else {
          // Auto sign-in successful
          toast.success('Account created and signed in successfully!')
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          console.error('Signin error:', error)
          if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the verification link to complete signup.')
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.')
          } else {
            setError(error.message)
          }
        } else {
          toast.success('Logged in successfully!')
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`)
    } finally {
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

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password {isSignUp && <span className="text-gray-500">(min 6 characters)</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignUp ? 6 : undefined}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setEmail('')
              setPassword('')
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {isSignUp && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> After signing up, you'll receive a verification email. 
              Please check your inbox and click the verification link to complete your account setup.
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
