import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      return NextResponse.json({
        error: 'OpenAI API key is missing',
        hasApiKey: false,
        envVars: {
          OPENAI_API_KEY: openaiApiKey ? 'Present' : 'Missing'
        }
      }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    })

    // Test with a simple prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Write a short LinkedIn post about AI in business (max 50 words)"
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    })

    const generatedPost = completion.choices[0]?.message?.content || 'No response'

    return NextResponse.json({
      success: true,
      hasApiKey: true,
      generatedPost,
      model: completion.model,
      usage: completion.usage
    })

  } catch (error: any) {
    console.error('Test generate error:', error)
    
    return NextResponse.json({
      error: 'OpenAI API test failed',
      details: error.message,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      envVars: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Present' : 'Missing'
      }
    }, { status: 500 })
  }
}
