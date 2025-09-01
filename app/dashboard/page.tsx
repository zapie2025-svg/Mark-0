'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setSession(session)
      setLoading(false)
      
      // If user is not authenticated, redirect to signup
      if (!session) {
        router.push('/signup')
      }
    }).catch((error: any) => {
      console.error('Session check error:', error)
      setLoading(false)
      router.push('/signup')
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session)
      if (!session) {
        router.push('/signup')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If user is not authenticated, don't render anything (will redirect)
  if (!session) {
    return null
  }

  return <Dashboard user={session.user} />
}

