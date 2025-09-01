import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { headline, industry, firstName, lastName, useSurveyData = false } = body

    if (!headline) {
      return NextResponse.json({ error: 'Headline is required' }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Generate recommendations using ChatGPT
    const recommendations = await generateRecommendations(headline, industry, firstName, lastName, useSurveyData)

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateRecommendations(headline: string, industry?: string, firstName?: string, lastName?: string, useSurveyData = false) {
  const systemPrompt = `You are an expert LinkedIn content strategist and recommendation engine. 
Given a user's professional information and survey data, your job is to suggest highly personalized LinkedIn post topics. 

Your recommendations should:  
- Be extremely personalized to the user's specific role, experience level, and goals.  
- Balance between thought leadership, storytelling, industry insights, and personal branding.  
- Include 6 content topic ideas with suggested angles or formats (e.g., "personal story", "industry insight", "how-to", "trending commentary").  
- Be specific enough to inspire posts, not generic.  
- Consider the user's target audience and content preferences.
- Make each recommendation unique and tailored to their specific situation.

Always output in a clear, structured format with the following structure for each recommendation:

1. [Topic Title]
   Format: [format type]
   Angle: [specific angle or approach]
   Hashtags: [3-5 relevant hashtags]

Make the content authentic, professional, and highly personalized to their specific circumstances.`

  const userPrompt = `Professional Information:
- Name: ${firstName || 'Professional'} ${lastName || ''}
- Role/Headline: ${headline}
- Industry: ${industry || 'Professional services'}

${useSurveyData ? `
Additional Survey Data:
- Current Role: ${headline}
- Industry: ${industry}
- Experience Level: [From survey]
- Goals: [From survey - personal branding, get job, establish leadership, etc.]
- Target Audience: [From survey]
- Content Preferences: [From survey]

Please generate 6 highly personalized LinkedIn post topic recommendations based on this comprehensive information. Make each topic extremely specific to their role, experience level, goals, and target audience. Consider their content preferences and create unique recommendations that would be different even for someone with a similar background but different goals or audience.
` : `
Please generate 6 personalized LinkedIn post topic recommendations based on this information. Make each topic specific and actionable.
`}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the response and structure it into recommendations
    const recommendations = parseAIRecommendations(response, headline, industry)

    return recommendations

  } catch (error) {
    console.error('OpenAI API error:', error)
    // Return fallback recommendations if AI fails
    return generateFallbackTopicRecommendations(headline, industry)
  }
}

function parseAIRecommendations(aiResponse: string, headline: string, industry?: string): any[] {
  try {
    const lines = aiResponse.split('\n')
    const recommendations = []
    let currentRecommendation: any = {}

    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Check if this is a numbered topic (1., 2., etc.)
      const topicMatch = trimmedLine.match(/^\d+\.\s*(.+)/)
      if (topicMatch) {
        if (currentRecommendation.title) {
          recommendations.push(currentRecommendation)
        }
        currentRecommendation = {
          id: `ai-recommendation-${Date.now()}-${Math.random()}`,
          title: topicMatch[1],
          format: '',
          angle: '',
          hashtags: [],
          type: 'ai-generated'
        }
      } else if (trimmedLine.toLowerCase().startsWith('format:')) {
        currentRecommendation.format = trimmedLine.replace(/^format:\s*/i, '').trim()
      } else if (trimmedLine.toLowerCase().startsWith('angle:')) {
        currentRecommendation.angle = trimmedLine.replace(/^angle:\s*/i, '').trim()
      } else if (trimmedLine.toLowerCase().startsWith('hashtags:')) {
        const hashtagText = trimmedLine.replace(/^hashtags:\s*/i, '').trim()
        const hashtags = hashtagText.match(/#\w+/g) || []
        currentRecommendation.hashtags = hashtags
      }
    }

    // Add the last recommendation
    if (currentRecommendation.title) {
      recommendations.push(currentRecommendation)
    }

    // If parsing failed, return fallback recommendations
    if (recommendations.length === 0) {
      return generateFallbackTopicRecommendations(headline, industry)
    }

    return recommendations.slice(0, 6) // Ensure we only return up to 6 recommendations

  } catch (error) {
    console.error('Error parsing AI response:', error)
    return generateFallbackTopicRecommendations(headline, industry)
  }
}

function generateFallbackTopicRecommendations(headline: string, industry?: string): any[] {
  const baseTopics = [
    // Thought Leadership Topics
    {
      id: `thought-leadership-${Date.now()}-1`,
      type: 'thought-leadership',
      title: `Key Trends Shaping the ${industry || 'Industry'} in 2024`,
      description: 'Share your insights on emerging trends and how they impact your field.',
      hashtags: [`#${industry?.replace(/\s+/g, '') || 'IndustryTrends'}`, '#ThoughtLeadership', '#Innovation']
    },
    {
      id: `thought-leadership-${Date.now()}-2`,
      type: 'thought-leadership',
      title: `Lessons Learned as a ${headline}`,
      description: 'Share valuable insights and experiences from your professional journey.',
      hashtags: ['#LessonsLearned', '#ProfessionalGrowth', '#Leadership']
    },
    
    // Networking Topics
    {
      id: `networking-${Date.now()}-1`,
      type: 'networking',
      title: `Connecting with Fellow ${industry || 'Industry'} Professionals`,
      description: 'Build relationships and expand your network in your field.',
      hashtags: ['#Networking', '#ProfessionalConnections', `#${industry?.replace(/\s+/g, '') || 'Community'}`]
    },
    {
      id: `networking-${Date.now()}-2`,
      type: 'networking',
      title: 'Mentorship and Career Development',
      description: 'Share experiences about mentorship and helping others grow.',
      hashtags: ['#Mentorship', '#CareerDevelopment', '#ProfessionalGrowth']
    },
    
    // Industry Insight Topics
    {
      id: `industry-insight-${Date.now()}-1`,
      type: 'industry-insight',
      title: `Latest Developments in ${industry || 'Your Industry'}`,
      description: 'Comment on recent news and developments affecting your industry.',
      hashtags: [`#${industry?.replace(/\s+/g, '') || 'IndustryNews'}`, '#IndustryInsights', '#Trends']
    },
    {
      id: `industry-insight-${Date.now()}-2`,
      type: 'industry-insight',
      title: 'Technology Impact on Your Field',
      description: 'Discuss how new technologies are transforming your industry.',
      hashtags: ['#Technology', '#Innovation', '#DigitalTransformation']
    },
    
    // Personal Brand Topics
    {
      id: `personal-brand-${Date.now()}-1`,
      type: 'personal-brand',
      title: 'My Journey to Becoming a ' + headline,
      description: 'Share your career story and what led you to your current role.',
      hashtags: ['#CareerJourney', '#PersonalBrand', '#ProfessionalStory']
    },
    {
      id: `personal-brand-${Date.now()}-2`,
      type: 'personal-brand',
      title: 'Behind the Scenes: A Day in the Life',
      description: 'Give your network a glimpse into your daily work routine.',
      hashtags: ['#DayInTheLife', '#BehindTheScenes', '#WorkLife']
    }
  ]

  return baseTopics
}
