import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { topic, tone } = await request.json()

    if (!topic || !tone) {
      return NextResponse.json(
        { error: 'Topic and tone are required' },
        { status: 400 }
      )
    }

    // Create a professional LinkedIn post prompt
    const prompt = `Create a professional LinkedIn post about "${topic}" with a ${tone} tone. 

Requirements:
- Write in a professional, engaging style suitable for LinkedIn
- Include relevant hashtags (3-5 hashtags)
- Keep it between 100-300 words
- Make it engaging and shareable
- Include a call-to-action if appropriate
- Use proper LinkedIn formatting with line breaks

Topic: ${topic}
Tone: ${tone}

LinkedIn Post:`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional LinkedIn content creator. Create engaging, professional posts that are optimized for LinkedIn's algorithm and audience."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const generatedPost = completion.choices[0]?.message?.content || 'Failed to generate post'

    return NextResponse.json({
      content: generatedPost,
      topic,
      tone,
      generated_at: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error generating post:', error)
    
    // Fallback to mock response if API fails
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate post. Please try again.' },
      { status: 500 }
    )
  }
}
