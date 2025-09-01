import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { withRateLimit, rateLimiters } from '@/lib/rate-limiter'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generatePostWithChatGPT(topic: string, tone: string, audience?: string, goals?: string): Promise<string> {
  const systemPrompt = `You are a LinkedIn content strategist who specializes in helping professionals and businesses grow their influence on LinkedIn. Your role is to create engaging, authentic, and authority-building posts tailored to the user's audience and goals.

Key requirements:
- Create posts that are optimized for LinkedIn engagement (likes, comments, shares)
- Use clear hooks to grab attention in the first line
- Structure content with bullet points, emojis, and scannable format
- Include strong calls-to-action
- Keep content authentic and professional
- Use relevant hashtags (3-5 hashtags)
- Make posts between 800-1200 characters for optimal LinkedIn performance
- Focus on providing value and insights

Format the response as a complete LinkedIn post ready to publish.`

  const userPrompt = `Please create a LinkedIn post about "${topic}" with the following specifications:

Tone: ${tone}
${audience ? `Target Audience: ${audience}` : ''}
${goals ? `Content Goals: ${goals}` : ''}

Create an engaging, authentic LinkedIn post that will resonate with the audience and achieve the specified goals. Make sure to include:
- A compelling hook in the first line
- Valuable insights and actionable takeaways
- Professional yet engaging tone
- Relevant hashtags
- A strong call-to-action

The post should be ready to publish on LinkedIn.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || 'Failed to generate post'
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate post with ChatGPT')
  }
}

export const POST = withRateLimit(rateLimiters.postGeneration)(async (request: NextRequest) => {
  let topic: string = '', tone: string = '', audience: string = '', goals: string = ''
  
  try {
    const body = await request.json()
    topic = body.topic || ''
    tone = body.tone || 'professional'
    audience = body.audience || ''
    goals = body.goals || ''

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Generate post using ChatGPT
    const generatedPost = await generatePostWithChatGPT(topic, tone, audience, goals)

    return NextResponse.json({
      content: generatedPost,
      topic,
      tone,
      audience,
      goals,
      generated_at: new Date().toISOString(),
      note: 'Generated using ChatGPT'
    })

  } catch (error: any) {
    console.error('Error generating post:', error)
    
    // Fallback post in case of any errors
    const fallbackPost = `🚀 Exciting insights on ${topic}!

As we explore the world of ${topic}, there are incredible opportunities waiting to be discovered.

Key highlights:
• Understanding the fundamentals
• Exploring new possibilities
• Building for the future

What's your take on ${topic}? Share your thoughts below!

#${topic.replace(/\s+/g, '')} #Innovation #Growth #ProfessionalDevelopment`

    return NextResponse.json({
      content: fallbackPost,
      topic,
      tone,
      generated_at: new Date().toISOString(),
      note: 'Generated using fallback system due to error',
      error: error.message
    })
  }
})
