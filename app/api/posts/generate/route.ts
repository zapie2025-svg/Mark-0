import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
const postTemplates = {
  professional: [
    {
      intro: "🚀 Exciting developments in {topic}!",
      body: "As we navigate the evolving landscape of {topic}, it's crucial to understand the key drivers and opportunities that lie ahead.\n\nKey insights:\n• Strategic importance of {topic}\n• Emerging trends and innovations\n• Best practices for implementation\n\nWhat's your experience with {topic}? I'd love to hear your perspective in the comments below!",
      hashtags: "#ProfessionalDevelopment #Innovation #Growth"
    },
    {
      intro: "💡 Deep dive into {topic} - a game-changer for modern business.",
      body: "The impact of {topic} on today's business environment cannot be overstated. Here's what you need to know:\n\n🔍 Current State:\n• Market dynamics and trends\n• Competitive landscape analysis\n• Future outlook and predictions\n\n🎯 Actionable Takeaways:\n• Implementation strategies\n• Risk mitigation approaches\n• Success measurement frameworks\n\nHow is {topic} shaping your industry? Share your thoughts!",
      hashtags: "#BusinessStrategy #Leadership #IndustryInsights"
    }
  ],
  casual: [
    {
      intro: "Hey everyone! 👋 Just wanted to share some thoughts on {topic}.",
      body: "So I've been thinking a lot about {topic} lately, and honestly, it's pretty fascinating stuff!\n\nHere's what I've learned:\n• The cool things about {topic}\n• Why it matters to all of us\n• How we can make the most of it\n\nWhat do you think? Anyone else exploring {topic}? Drop your thoughts below! 👇",
      hashtags: "#Networking #Community #Learning"
    },
    {
      intro: "Quick thought on {topic} that I wanted to share! 💭",
      body: "You know what's really interesting about {topic}? It's not just about the technical side - it's about how it connects people and ideas.\n\nMy take:\n• The human element of {topic}\n• Real-world applications\n• Why it's worth paying attention to\n\nCurious to hear your experiences with {topic}! What's your story?",
      hashtags: "#PersonalGrowth #Connections #Innovation"
    }
  ],
  enthusiastic: [
    {
      intro: "🔥 AMAZING insights on {topic} that will blow your mind!",
      body: "I'm absolutely thrilled to share these incredible findings about {topic}! This is going to revolutionize how we think about it.\n\n🚀 What's So Exciting:\n• Breakthrough developments in {topic}\n• Revolutionary applications\n• Game-changing opportunities\n\n💪 Why You Should Care:\n• Competitive advantages\n• Future-proofing strategies\n• Success stories and case studies\n\nThis is HUGE! What excites you most about {topic}? Let's discuss! 🎉",
      hashtags: "#Innovation #Excitement #FutureOfWork"
    },
    {
      intro: "🎯 WOW! {topic} is absolutely TRANSFORMING our industry!",
      body: "I can't contain my excitement about the incredible potential of {topic}! This is a game-changer, folks!\n\n🌟 The Revolution:\n• Cutting-edge developments\n• Industry disruption\n• Massive opportunities ahead\n\n⚡ Why This Matters:\n• Competitive edge strategies\n• Innovation leadership\n• Success in the new era\n\nAre you as pumped about {topic} as I am? Share your enthusiasm! 🚀",
      hashtags: "#Transformation #Leadership #Innovation"
    }
  ],
  thoughtful: [
    {
      intro: "🤔 Reflecting on the deeper implications of {topic}...",
      body: "As I contemplate the broader significance of {topic}, I'm struck by its profound impact on our collective future.\n\n💭 Key Reflections:\n• Philosophical implications\n• Societal impact and responsibility\n• Long-term consequences\n\n🧠 Critical Questions:\n• What does this mean for humanity?\n• How do we navigate the challenges?\n• What role do we play in shaping the outcome?\n\nI'd love to hear your thoughtful perspectives on {topic}. What are your reflections?",
      hashtags: "#DeepThinking #Philosophy #Future"
    },
    {
      intro: "📚 A thoughtful exploration of {topic} and its complexities...",
      body: "The more I study {topic}, the more I realize how interconnected and nuanced this subject truly is.\n\n🔍 Complex Dimensions:\n• Historical context and evolution\n• Current challenges and opportunities\n• Future implications and possibilities\n\n🤝 Collaborative Insights:\n• Diverse perspectives needed\n• Interdisciplinary approaches\n• Collective wisdom and experience\n\nWhat aspects of {topic} do you find most thought-provoking? Let's explore together.",
      hashtags: "#CriticalThinking #Collaboration #Insights"
    }
  ],
  humorous: [
    {
      intro: "😂 The hilarious truth about {topic} that nobody talks about!",
      body: "Okay, let's be real about {topic} - it's like that friend who's always late but somehow makes it work! 😅\n\n🎭 The Comedy:\n• The funny side of {topic}\n• Unexpected situations and solutions\n• Learning to laugh at the challenges\n\n😄 Silver Linings:\n• Finding joy in the process\n• Building resilience through humor\n• Connecting through shared experiences\n\nAnyone else have some funny {topic} stories? Let's share the laughs! 😆",
      hashtags: "#Humor #WorkLife #Positivity"
    },
    {
      intro: "🤪 My adventures with {topic} - a comedy of errors and triumphs!",
      body: "Picture this: you're trying to master {topic}, and suddenly you're in a sitcom episode you never signed up for! 😂\n\n🎬 The Plot:\n• Unexpected twists and turns\n• Character development (that's us!)\n• Happy endings and lessons learned\n\n🎪 The Show Must Go On:\n• Embracing the chaos\n• Finding humor in challenges\n• Celebrating small victories\n\nWhat's your {topic} comedy story? I'm all ears! 👂",
      hashtags: "#Adventures #Learning #Fun"
    }
  ]
}

// Topic-specific content enhancements
const topicEnhancements = {
  'AI': {
    keywords: ['artificial intelligence', 'machine learning', 'automation', 'digital transformation'],
    examples: ['ChatGPT', 'automated workflows', 'predictive analytics', 'smart systems']
  },
  'business': {
    keywords: ['strategy', 'growth', 'innovation', 'leadership'],
    examples: ['market expansion', 'customer experience', 'operational efficiency', 'competitive advantage']
  },
  'technology': {
    keywords: ['innovation', 'digital', 'automation', 'future'],
    examples: ['cloud computing', 'mobile apps', 'IoT', 'blockchain']
  },
  'marketing': {
    keywords: ['brand', 'engagement', 'conversion', 'growth'],
    examples: ['social media', 'content strategy', 'customer acquisition', 'brand awareness']
  },
  'leadership': {
    keywords: ['management', 'team building', 'vision', 'strategy'],
    examples: ['employee engagement', 'organizational culture', 'decision making', 'mentorship']
  }
}

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

export async function POST(request: NextRequest) {
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
}
