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

Your task is to generate 10 LinkedIn content topic ideas for this user with a specific focus on their role.

## CRITICAL WEIGHTING REQUIREMENTS
**80% of recommendations (8 out of 10) MUST be primarily focused on the user's specific role and responsibilities.**
**20% of recommendations (2 out of 10) can be based on other factors like industry trends, personal branding, or general professional development.**

## Role-Based Focus Guidelines (80% - 8 recommendations)
- Topics should directly relate to the user's specific job title and daily responsibilities
- Focus on challenges, insights, and experiences specific to their role
- Include role-specific tools, methodologies, and best practices
- Address common problems and solutions in their field
- Share role-specific career advice and growth strategies
- Discuss role-specific industry trends and developments
- Include role-specific networking and collaboration topics
- Address role-specific skill development and learning

## Other Factors (20% - 2 recommendations)
- Industry-wide trends and developments
- General professional development and career growth
- Personal branding and thought leadership
- Work-life balance and productivity
- Cross-functional collaboration and networking

## Content Style Guidelines
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

IMPORTANT: Ensure 8 out of 10 recommendations are heavily focused on the user's specific role and responsibilities.`

  const userPrompt = `## User Context
**PRIMARY FOCUS - Role**: ${role}
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

## CRITICAL INSTRUCTIONS
Generate 10 LinkedIn content topic ideas with the following distribution:
- **8 recommendations (80%)**: Heavily focused on the user's specific role as "${role}" - their daily responsibilities, challenges, tools, methodologies, and role-specific insights
- **2 recommendations (20%)**: Based on other factors like industry trends, general professional development, or personal branding

Focus on creating role-specific content that demonstrates expertise and provides value to others in similar roles.`

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
    // ROLE-BASED TOPICS (80% - 8 recommendations)
    {
      id: `role-specific-${Date.now()}-1`,
      title: `Daily Challenges I Face as a ${role}`,
      format: 'Story',
      angle: 'Real challenges and how I overcome them',
      hashtags: [`#${role.replace(/\s+/g, '')}`, '#ProfessionalChallenges', '#ProblemSolving']
    },
    {
      id: `role-specific-${Date.now()}-2`,
      title: `Essential Tools Every ${role} Should Know`,
      format: 'Tips & Insights',
      angle: 'Role-specific tools and their benefits',
      hashtags: [`#${role.replace(/\s+/g, '')}`, '#Tools', '#Productivity']
    },
    {
      id: `role-specific-${Date.now()}-3`,
      title: `How I Improved My ${role} Skills This Year`,
      format: 'Story',
      angle: 'Personal skill development journey',
      hashtags: [`#${role.replace(/\s+/g, '')}`, '#SkillDevelopment', '#Growth']
    },
    {
      id: `role-specific-${Date.now()}-4`,
      title: `Common Mistakes New ${role}s Make`,
      format: 'Tips & Insights',
      angle: 'Lessons learned from experience',
      hashtags: [`#${role.replace(/\s+/g, '')}`, '#CareerAdvice', '#LessonsLearned']
    },
    {
      id: `role-specific-${Date.now()}-5`,
      title: `The Future of ${role} in ${industry}`,
      format: 'Thought Leadership',
      angle: 'Role-specific industry predictions',
      hashtags: [`#${role.replace(/\s+/g, '')}`, '#FutureOfWork', '#IndustryTrends']
    },
    {
      id: `role-specific-${Date.now()}-6`,
      title: `Behind the Scenes: A Typical Day as a ${role}`,
      format: 'Behind-the-Scenes',
      angle: 'Authentic daily routine and responsibilities',
      hashtags: [`#${role.replace(/\s+/g, '')}`, '#DayInTheLife', '#WorkLife']
    },
    {
      id: `role-specific-${Date.now()}-7`,
      title: `Key Metrics I Track as a ${role}`,
      format: 'Case Study',
      angle: 'Role-specific performance indicators',
      hashtags: [`#${role.replace(/\s+/g, '')}`, '#Metrics', '#Performance']
    },
    {
      id: `role-specific-${Date.now()}-8`,
      title: `Networking Tips for ${role}s`,
      format: 'Tips & Insights',
      angle: 'Role-specific networking strategies',
      hashtags: [`#${role.replace(/\s+/g, '')}`, '#Networking', '#ProfessionalGrowth']
    },
    
    // OTHER FACTORS (20% - 2 recommendations)
    {
      id: `general-${Date.now()}-1`,
      title: `Industry Trends That Will Impact ${industry} in 2024`,
      format: 'Thought Leadership',
      angle: 'Broader industry analysis and predictions',
      hashtags: [`#${industry.replace(/\s+/g, '')}`, '#IndustryTrends', '#Innovation']
    },
    {
      id: `general-${Date.now()}-2`,
      title: 'Building Your Personal Brand in the Digital Age',
      format: 'Tips & Insights',
      angle: 'General personal branding strategies',
      hashtags: ['#PersonalBrand', '#DigitalMarketing', '#ProfessionalGrowth']
    }
  ]

  return baseTopics
}
