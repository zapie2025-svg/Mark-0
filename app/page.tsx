'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthPage from '@/components/AuthPage'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setSession(session)
      setLoading(false)
    }).catch((error: any) => {
      console.error('Session check error:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return session ? <Dashboard user={session.user} /> : <AuthPage />
}
