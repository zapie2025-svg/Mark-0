import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in demo mode (using placeholder values)
const isDemoMode = !supabaseUrl || 
  supabaseUrl === 'your_supabase_project_url_here' || 
  !supabaseAnonKey || 
  supabaseAnonKey === 'your_supabase_anon_key_here'

if (isDemoMode) {
  console.warn('🚀 Demo Mode: Using mock data. Set up Supabase credentials in .env.local for full functionality.')
} else {
  console.log('✅ Supabase Mode: Using real Supabase connection')
  console.log('🔍 Supabase URL:', supabaseUrl)
  console.log('🔍 Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing')
}

// Create a mock client for demo mode
const createMockClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOAuth: async () => ({ error: new Error('Demo mode: Please set up Supabase credentials') }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: null, error: new Error('Demo mode') }),
        update: () => Promise.resolve({ data: null, error: new Error('Demo mode') })
      })
    })
  } as any
}

// Create the actual Supabase client or mock client
export const supabase = isDemoMode ? createMockClient() : createClient(supabaseUrl!, supabaseAnonKey!)

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          status: 'draft' | 'scheduled' | 'published'
          schedule_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          status?: 'draft' | 'scheduled' | 'published'
          schedule_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          status?: 'draft' | 'scheduled' | 'published'
          schedule_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          total_posts: number
          last_activity_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          total_posts?: number
          last_activity_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          total_posts?: number
          last_activity_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
