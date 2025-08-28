import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Check if LinkedIn OAuth is configured in Supabase
    const linkedinOAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=linkedin&redirect_to=${encodeURIComponent('https://mark-0.netlify.app/dashboard')}`
    
    return NextResponse.json({
      status: 'LinkedIn OAuth Test',
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseAnonKey: supabaseAnonKey ? 'Configured' : 'Missing',
      linkedinOAuthUrl: linkedinOAuthUrl,
      instructions: [
        '1. Check if LinkedIn provider is enabled in Supabase Dashboard',
        '2. Verify Client ID and Client Secret are correct',
        '3. Ensure redirect URLs are properly configured',
        '4. Test the LinkedIn OAuth URL above'
      ],
      testUrl: linkedinOAuthUrl
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to test LinkedIn OAuth',
      details: error.message
    }, { status: 500 })
  }
}
