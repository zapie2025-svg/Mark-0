import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    return NextResponse.json({
      success: true,
      supabaseUrl: supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      session: data.session ? 'Session exists' : 'No session',
      error: error?.message || null
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
  }
}
