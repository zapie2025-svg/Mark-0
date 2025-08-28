import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { topic, tone } = await request.json()

    if (!topic || !tone) {
      return NextResponse.json(
        { error: 'Topic and tone are required' },
        { status: 400 }
      )
    }

    // Mock AI post generation based on topic and tone
    const mockPosts = {
      professional: [
        `🚀 **${topic}**: A Game-Changer in Today's Business Landscape\n\nIn today's rapidly evolving market, ${topic.toLowerCase()} has emerged as a critical factor for organizational success. Companies that embrace this trend are seeing remarkable improvements in efficiency, productivity, and competitive advantage.\n\nKey insights:\n• Strategic implementation approaches\n• Measurable business outcomes\n• Future industry implications\n\nWhat's your experience with ${topic.toLowerCase()}? I'd love to hear your thoughts in the comments below.\n\n#${topic.replace(/\s+/g, '')} #BusinessStrategy #Innovation #ProfessionalDevelopment`,
        `📊 **The Impact of ${topic} on Modern Business Operations**\n\nAs we navigate through 2024, ${topic.toLowerCase()} continues to reshape how organizations operate and compete. The data shows compelling evidence of its transformative power across industries.\n\nRecent findings indicate:\n• 73% of companies report improved performance\n• 89% see enhanced team collaboration\n• 67% experience cost reductions\n\nThis isn't just a trend—it's a fundamental shift in how we approach business challenges.\n\nHow is your organization leveraging ${topic.toLowerCase()}? Share your success stories!\n\n#${topic.replace(/\s+/g, '')} #BusinessGrowth #DigitalTransformation #Leadership`
      ],
      casual: [
        `Hey LinkedIn fam! 👋\n\nSo I've been diving deep into ${topic.toLowerCase()} lately, and honestly? It's pretty mind-blowing stuff! 🤯\n\nHere's what I've learned:\n✨ It's way more accessible than I thought\n✨ The results are actually measurable\n✨ People are genuinely excited about it\n\nAnyone else exploring ${topic.toLowerCase()}? Would love to connect with fellow enthusiasts and swap stories!\n\nDrop a comment if you're on this journey too! 👇\n\n#${topic.replace(/\s+/g, '')} #Learning #Networking #Growth`,
        `Quick thought on ${topic}... 💭\n\nSometimes the best insights come from unexpected places. I was chatting with a colleague about ${topic.toLowerCase()} the other day, and they shared this perspective that completely changed how I think about it.\n\nIt's amazing how much we can learn from each other when we stay curious and open-minded.\n\nWhat's the most surprising thing you've learned about ${topic.toLowerCase()} recently?\n\n#${topic.replace(/\s+/g, '')} #Curiosity #Learning #Community`
      ],
      enthusiastic: [
        `🔥 **${topic} is ABSOLUTELY REVOLUTIONARY!** 🔥\n\nI cannot contain my excitement about what ${topic.toLowerCase()} is doing for businesses right now! This is the kind of breakthrough that comes once in a decade!\n\n🚀 Here's why I'm so pumped:\n• INCREDIBLE results across the board\n• Game-changing innovation potential\n• Massive opportunities for growth\n\nIf you're not paying attention to ${topic.toLowerCase()}, you're missing out on something HUGE!\n\nWho else is as excited about this as I am? Let's connect and build something amazing together! 💪\n\n#${topic.replace(/\s+/g, '')} #Innovation #Excitement #Opportunity #Growth`,
        `🎉 **BREAKING: ${topic} is Changing Everything!** 🎉\n\nI just had to share this because I'm literally jumping with joy! ${topic} is not just a trend—it's a COMPLETE PARADIGM SHIFT!\n\nWhat we're seeing:\n🌟 Unprecedented transformation\n🌟 Incredible success stories\n🌟 Boundless possibilities\n\nThis is the future, and it's happening NOW! Are you ready to be part of this amazing journey?\n\nLet's make some magic happen! ✨\n\n#${topic.replace(/\s+/g, '')} #Future #Innovation #Success #Excitement`
      ],
      thoughtful: [
        `🤔 **Reflections on ${topic}**\n\nAs I sit here contemplating the broader implications of ${topic.toLowerCase()}, I'm struck by the profound ways it's reshaping our understanding of what's possible.\n\nThis isn't merely about technological advancement—it's about human potential, collaboration, and the evolution of how we work together to solve complex challenges.\n\nKey considerations:\n• Ethical implications and responsibilities\n• Long-term sustainability factors\n• Impact on human connection and creativity\n\nWhat deeper questions does ${topic.toLowerCase()} raise for you? I'd love to explore these ideas together.\n\n#${topic.replace(/\s+/g, '')} #Reflection #Philosophy #Innovation #Humanity`,
        `💭 **The Deeper Meaning Behind ${topic}**\n\nSometimes, in our rush to adopt new technologies and methodologies, we miss the fundamental questions that ${topic.toLowerCase()} forces us to confront.\n\nIt's not just about efficiency or profit—it's about how we choose to spend our time, energy, and attention in an increasingly complex world.\n\nThis moment invites us to consider:\n• What truly matters in our work?\n• How do we maintain authenticity in change?\n• What legacy are we building?\n\nYour thoughts on these questions? I'm genuinely curious to hear different perspectives.\n\n#${topic.replace(/\s+/g, '')} #Meaning #Purpose #Authenticity #Reflection`
      ],
      humorous: [
        `😂 **The ${topic} Chronicles: A Comedy of Errors**\n\nSo there I was, trying to implement ${topic.toLowerCase()} like I actually knew what I was doing... Spoiler alert: I didn't! 😅\n\nHere's what actually happened:\n• Me: "This will be easy!"\n• Reality: *laughs in complexity*\n• Me: "Maybe I should read the manual?"\n• Also me: "Nah, I got this!"\n\nPlot twist: I did NOT "got this" 🤦‍♂️\n\nBut you know what? We figured it out, and now I can laugh about it! Anyone else have similar ${topic.toLowerCase()} adventures?\n\nShare your funny stories below! 👇\n\n#${topic.replace(/\s+/g, '')} #Learning #Humor #Growth #Relatable`,
        `🎭 **${topic}: The Dramatic Saga**\n\n*Dramatic music plays* 🎵\n\nAct 1: "I can totally handle ${topic.toLowerCase()}"\nAct 2: "Why is everything on fire?" 🔥\nAct 3: "Wait, this is actually working?"\nAct 4: "I am now a ${topic.toLowerCase()} master!" 👑\n\n*Curtain falls*\n\nThe end... or is it? 😏\n\nWho else has lived this exact story? The struggle is real, but so are the victories!\n\n#${topic.replace(/\s+/g, '')} #Drama #Success #Humor #Journey`
      ]
    }

    const tonePosts = mockPosts[tone as keyof typeof mockPosts] || mockPosts.professional
    const randomPost = tonePosts[Math.floor(Math.random() * tonePosts.length)]

    return NextResponse.json({
      postContent: randomPost
    })

  } catch (error) {
    console.error('Error generating post:', error)
    return NextResponse.json(
      { error: 'Failed to generate post' },
      { status: 500 }
    )
  }
}
