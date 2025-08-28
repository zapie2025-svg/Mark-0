import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  let topic: string, tone: string
  
  try {
    const body = await request.json()
    topic = body.topic
    tone = body.tone

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
    
    // Check for specific error types
    if (error.message?.includes('API key') || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'OpenAI API rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Fallback to mock response for other errors
    const mockPost = `🚀 Exciting insights on ${topic}!

As we navigate the ever-evolving landscape of ${topic}, it's crucial to stay ahead of the curve. The ${tone} approach to this topic reveals fascinating opportunities for growth and innovation.

Key takeaways:
• Understanding the fundamentals
• Leveraging best practices
• Embracing new possibilities

What's your perspective on ${topic}? I'd love to hear your thoughts in the comments below!

#${topic.replace(/\s+/g, '')} #Innovation #Growth #ProfessionalDevelopment`

    return NextResponse.json({
      content: mockPost,
      topic,
      tone,
      generated_at: new Date().toISOString(),
      note: 'Generated using fallback due to API error'
    })
  }
}
