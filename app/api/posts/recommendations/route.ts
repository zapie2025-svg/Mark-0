import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      role, 
      industry, 
      experience_years, 
      goal, 
      content_style,
      linkedin_profile,
      useSurveyData = false 
    } = body

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Generate recommendations using the new improved prompt
    const recommendations = await generateRecommendations({
      role,
      industry,
      experience_years,
      goal,
      content_style,
      linkedin_profile,
      useSurveyData
    })

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface RecommendationParams {
  role: string
  industry?: string
  experience_years?: string
  goal?: string
  content_style?: string
  linkedin_profile?: {
    headline?: string
    about?: string
    skills?: string[]
    recent_posts?: string[]
  }
  useSurveyData?: boolean
}

async function generateRecommendations(params: RecommendationParams) {
  const {
    role,
    industry = 'Professional Services',
    experience_years = '3-5 years',
    goal = 'Personal Branding',
    content_style = 'Tips & Insights',
    linkedin_profile = {},
    useSurveyData = false
  } = params

  const systemPrompt = `You are an expert LinkedIn content strategist and personal branding coach.

Your task is to generate 10 LinkedIn content topic ideas for this user.

## Guidelines
Topics must be **personalized** to the user's role, industry, skills, and experience.
Topics must align with their **main goal** (e.g., get a job, establish leadership, grow network).
Each topic should follow their **preferred content style**:
- Stories (personal journey, failures, lessons)
- Tips & Insights (actionable advice)
- Thought Leadership (industry trends, predictions)
- Case Studies (examples from work/projects)
- Behind-the-Scenes (daily work, learning process)

Topics should **resonate with their target LinkedIn audience** and encourage engagement.
Topics must be **LinkedIn-friendly**: short, clear, and professional, but also conversational.

For each topic, suggest:
**Title**: Clear, engaging post title
**Format**: Story / Insight / Tip / Trend / Case Study
**Angle**: Recommended approach (e.g., "personal lesson from failure" or "industry trend with unique perspective")
**Hashtags**: 3–5 relevant hashtags

## Output Format (JSON)
Return ONLY valid JSON array with exactly 10 recommendations in this format:
[
  {
    "id": "topic-1",
    "title": "How I transitioned from design to product management in SaaS",
    "format": "Story",
    "angle": "Personal career journey with lessons learned",
    "hashtags": ["#ProductManagement", "#CareerGrowth", "#SaaS"]
  }
]

Make each recommendation unique, specific to their situation, and highly actionable.`

  const userPrompt = `## User Context
Role: ${role}
Industry: ${industry}
Years of Experience: ${experience_years}
Main Goal: ${goal}
Preferred Content Style: ${content_style}

## LinkedIn Profile
Headline: ${linkedin_profile.headline || 'Not provided'}
About: ${linkedin_profile.about || 'Not provided'}
Skills: ${linkedin_profile.skills ? linkedin_profile.skills.join(', ') : 'Not provided'}
Recent Posts: ${linkedin_profile.recent_posts ? linkedin_profile.recent_posts.join(' | ') : 'Not provided'}

${useSurveyData ? `
## Additional Context
This user has completed a detailed survey about their professional goals and content preferences.
Please use this information to create even more personalized and targeted recommendations.
` : ''}

Generate 10 highly personalized LinkedIn content topic ideas that will help this user achieve their goal of "${goal}" while following their preferred content style of "${content_style}".`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const recommendations = parseAIRecommendations(response)

    return recommendations

  } catch (error) {
    console.error('OpenAI API error:', error)
    // Return fallback recommendations if AI fails
    return generateFallbackTopicRecommendations(role, industry, goal, content_style)
  }
}

function parseAIRecommendations(aiResponse: string): any[] {
  try {
    // Clean the response to extract JSON
    let jsonString = aiResponse.trim()
    
    // Remove any markdown formatting
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/```json\n?/, '').replace(/```\n?/, '')
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/```\n?/, '').replace(/```\n?/, '')
    }

    // Parse the JSON
    const recommendations = JSON.parse(jsonString)

    // Validate the structure
    if (!Array.isArray(recommendations)) {
      throw new Error('Response is not an array')
    }

    // Ensure each recommendation has the required fields
    const validRecommendations = recommendations.filter(rec => 
      rec.id && rec.title && rec.format && rec.angle && Array.isArray(rec.hashtags)
    )

    // If parsing failed or no valid recommendations, return fallback
    if (validRecommendations.length === 0) {
      throw new Error('No valid recommendations found')
    }

    return validRecommendations.slice(0, 10) // Ensure we only return up to 10 recommendations

  } catch (error) {
    console.error('Error parsing AI response:', error)
    console.error('Raw response:', aiResponse)
    return generateFallbackTopicRecommendations('Professional', 'Professional Services', 'Personal Branding', 'Tips & Insights')
  }
}

function generateFallbackTopicRecommendations(role: string, industry: string, goal: string, content_style: string): any[] {
  const baseTopics = [
    // Thought Leadership Topics
    {
      id: `thought-leadership-${Date.now()}-1`,
      title: `Key Trends Shaping the ${industry} in 2024`,
      format: 'Thought Leadership',
      angle: 'Industry trend analysis with personal insights',
      hashtags: [`#${industry.replace(/\s+/g, '')}`, '#ThoughtLeadership', '#Innovation']
    },
    {
      id: `thought-leadership-${Date.now()}-2`,
      title: `Lessons Learned as a ${role}`,
      format: 'Story',
      angle: 'Personal career journey with actionable insights',
      hashtags: ['#LessonsLearned', '#ProfessionalGrowth', '#Leadership']
    },
    
    // Networking Topics
    {
      id: `networking-${Date.now()}-1`,
      title: `Connecting with Fellow ${industry} Professionals`,
      format: 'Tips & Insights',
      angle: 'Practical networking strategies for industry professionals',
      hashtags: ['#Networking', '#ProfessionalConnections', `#${industry.replace(/\s+/g, '')}`]
    },
    {
      id: `networking-${Date.now()}-2`,
      title: 'Mentorship and Career Development',
      format: 'Story',
      angle: 'Personal mentorship experiences and lessons',
      hashtags: ['#Mentorship', '#CareerDevelopment', '#ProfessionalGrowth']
    },
    
    // Industry Insight Topics
    {
      id: `industry-insight-${Date.now()}-1`,
      title: `Latest Developments in ${industry}`,
      format: 'Thought Leadership',
      angle: 'Analysis of recent industry news and developments',
      hashtags: [`#${industry.replace(/\s+/g, '')}`, '#IndustryInsights', '#Trends']
    },
    {
      id: `industry-insight-${Date.now()}-2`,
      title: 'Technology Impact on Your Field',
      format: 'Case Study',
      angle: 'Real examples of technology transforming the industry',
      hashtags: ['#Technology', '#Innovation', '#DigitalTransformation']
    },
    
    // Personal Brand Topics
    {
      id: `personal-brand-${Date.now()}-1`,
      title: `My Journey to Becoming a ${role}`,
      format: 'Story',
      angle: 'Personal career story with key milestones',
      hashtags: ['#CareerJourney', '#PersonalBrand', '#ProfessionalStory']
    },
    {
      id: `personal-brand-${Date.now()}-2`,
      title: 'Behind the Scenes: A Day in the Life',
      format: 'Behind-the-Scenes',
      angle: 'Authentic glimpse into daily work routine',
      hashtags: ['#DayInTheLife', '#BehindTheScenes', '#WorkLife']
    },
    
    // Skill Development Topics
    {
      id: `skill-development-${Date.now()}-1`,
      title: `Essential Skills for ${role}s in 2024`,
      format: 'Tips & Insights',
      angle: 'Actionable advice for skill development',
      hashtags: ['#SkillDevelopment', '#ProfessionalGrowth', '#CareerAdvice']
    },
    {
      id: `skill-development-${Date.now()}-2`,
      title: 'How I Stay Updated in My Field',
      format: 'Tips & Insights',
      angle: 'Personal learning strategies and resources',
      hashtags: ['#ContinuousLearning', '#ProfessionalDevelopment', '#IndustryKnowledge']
    }
  ]

  return baseTopics
}
