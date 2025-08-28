'use client'

import { useState } from 'react'
import { Sparkles, Save, Calendar, Send, CheckCircle, Clock, Plus, LogOut, FileText, BarChart3, TrendingUp, Users, Eye, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from './Logo'

interface DraftPost {
  id: string
  content: string
  created_at: string
}

interface ScheduledPost {
  id: string
  content: string
  schedule_time: string
  created_at: string
}

export default function DemoMode() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'draft' | 'schedule' | 'publish'>('dashboard')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [generatedPost, setGeneratedPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [draftPosts, setDraftPosts] = useState<DraftPost[]>([
    {
      id: '1',
      content: '🚀 **AI in Business**: A Game-Changer in Today\'s Landscape\n\nIn today\'s rapidly evolving market, AI has emerged as a critical factor for organizational success. Companies that embrace this trend are seeing remarkable improvements in efficiency, productivity, and competitive advantage.\n\nKey insights:\n• Strategic implementation approaches\n• Measurable business outcomes\n• Future industry implications\n\nWhat\'s your experience with AI? I\'d love to hear your thoughts in the comments below.\n\n#AI #BusinessStrategy #Innovation #ProfessionalDevelopment',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      id: '2',
      content: '📊 **Remote Work Success**: Building Effective Teams\n\nAs we navigate the new normal of remote work, I\'ve discovered some key strategies that make all the difference:\n\n✨ Clear communication protocols\n✨ Regular check-ins and team building\n✨ Flexible but structured schedules\n\nThe results? 89% of our team reports higher productivity and satisfaction!\n\nWhat remote work strategies are working for your team?\n\n#RemoteWork #TeamBuilding #Productivity #Leadership',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    }
  ])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: 'scheduled-1',
      content: '🎉 **Project Launch Success!**\n\nAfter months of hard work, we\'ve successfully launched our new platform! The response has been incredible:\n\n🌟 500+ signups in the first week\n🌟 95% positive feedback\n🌟 3x faster than expected\n\nThis wouldn\'t have been possible without our amazing team and supportive community. Thank you all!\n\n#ProjectLaunch #Success #TeamWork #Innovation',
      schedule_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [scheduling, setScheduling] = useState<string | null>(null)
  
  // Streak tracking
  const [streakData, setStreakData] = useState({
    currentStreak: 7,
    longestStreak: 15,
    totalPosts: 23,
    lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
  })

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'thoughtful', label: 'Thoughtful' },
    { value: 'humorous', label: 'Humorous' },
  ]

  const generatePost = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockPost = `🚀 **${topic}**: A Game-Changer in Today's Business Landscape

In today's rapidly evolving market, ${topic.toLowerCase()} has emerged as a critical factor for organizational success. Companies that embrace this trend are seeing remarkable improvements in efficiency, productivity, and competitive advantage.

Key insights:
• Strategic implementation approaches
• Measurable business outcomes
• Future industry implications

What's your experience with ${topic.toLowerCase()}? I'd love to hear your thoughts in the comments below.

#${topic.replace(/\s+/g, '')} #BusinessStrategy #Innovation #ProfessionalDevelopment`
      
      setGeneratedPost(mockPost)
      toast.success('Post generated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate post')
    } finally {
      setLoading(false)
    }
  }

  const saveAsDraft = async () => {
    if (!generatedPost.trim()) {
      toast.error('No post content to save')
      return
    }

    const newDraft = {
      id: Date.now().toString(),
      content: generatedPost,
      created_at: new Date().toISOString()
    }

    setDraftPosts(prev => [newDraft, ...prev])
    
    // Update streak data
    const today = new Date().toDateString()
    const lastActivity = new Date(streakData.lastActivityDate).toDateString()
    
    if (today !== lastActivity) {
      setStreakData(prev => ({
        ...prev,
        currentStreak: prev.currentStreak + 1,
        longestStreak: Math.max(prev.currentStreak + 1, prev.longestStreak),
        totalPosts: prev.totalPosts + 1,
        lastActivityDate: new Date().toISOString()
      }))
    } else {
      setStreakData(prev => ({
        ...prev,
        totalPosts: prev.totalPosts + 1
      }))
    }
    
    toast.success('Draft saved successfully!')
    setGeneratedPost('')
    setTopic('')
  }

  const deleteDraft = (id: string) => {
    setDraftPosts(prev => prev.filter(draft => draft.id !== id))
    toast.success('Draft deleted successfully!')
  }

  const editDraft = (id: string) => {
    const draft = draftPosts.find(d => d.id === id)
    if (draft) {
      setGeneratedPost(draft.content)
      setTopic('Edit Draft')
      setActiveTab('create')
      toast.success('Draft loaded for editing!')
    }
  }

  const scheduleDraft = async (draftId: string) => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time')
      return
    }

    const scheduleTime = new Date(`${selectedDate}T${selectedTime}`).toISOString()
    
    setScheduling(draftId)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Check if it's a temporary draft (from preview card)
      if (draftId.startsWith('temp-')) {
        const scheduledPost: ScheduledPost = {
          id: `scheduled-${Date.now()}`,
          content: generatedPost,
          schedule_time: scheduleTime,
          created_at: new Date().toISOString()
        }
        
        setScheduledPosts(prev => [scheduledPost, ...prev])
        setGeneratedPost('')
        setTopic('')
        
        toast.success('Post scheduled successfully!')
        setSelectedDate('')
        setSelectedTime('')
      } else {
        // Handle regular draft from draft list
        const draft = draftPosts.find(d => d.id === draftId)
        if (draft) {
          const scheduledPost: ScheduledPost = {
            id: `scheduled-${Date.now()}`,
            content: draft.content,
            schedule_time: scheduleTime,
            created_at: draft.created_at
          }
          
          setScheduledPosts(prev => [scheduledPost, ...prev])
          setDraftPosts(prev => prev.filter(d => d.id !== draftId))
          
          toast.success('Post scheduled successfully!')
          setSelectedDate('')
          setSelectedTime('')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule post')
    } finally {
      setScheduling(null)
    }
  }

  const scheduleFromDraftTab = (draftId: string) => {
    const draft = draftPosts.find(d => d.id === draftId)
    if (draft) {
      setGeneratedPost(draft.content)
      setTopic('Schedule Draft')
      setActiveTab('schedule')
      toast.success('Draft loaded for scheduling!')
    }
  }

  const isPostReadyToPublish = (post: ScheduledPost) => {
    const scheduleTime = new Date(post.schedule_time)
    const now = new Date()
    return scheduleTime <= now
  }

  const publishPost = async (postId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setScheduledPosts(prev => prev.filter(post => post.id !== postId))
      
      // Update streak data for publishing
      const today = new Date().toDateString()
      const lastActivity = new Date(streakData.lastActivityDate).toDateString()
      
      if (today !== lastActivity) {
        setStreakData(prev => ({
          ...prev,
          currentStreak: prev.currentStreak + 1,
          longestStreak: Math.max(prev.currentStreak + 1, prev.longestStreak),
          totalPosts: prev.totalPosts + 1,
          lastActivityDate: new Date().toISOString()
        }))
      } else {
        setStreakData(prev => ({
          ...prev,
          totalPosts: prev.totalPosts + 1
        }))
      }
      
      toast.success('Post published successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish post')
    }
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'create' as const, label: 'Create Post', icon: Plus },
    { id: 'draft' as const, label: 'Draft', icon: FileText },
    { id: 'schedule' as const, label: 'Schedule', icon: Calendar },
    { id: 'publish' as const, label: 'Publish', icon: Send },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-2">
            <Logo size="lg" className="text-white" />
          </div>
          <p className="text-blue-100">
            <strong>Demo Mode:</strong> This is a fully functional demo with mock data. 
            Set up Supabase credentials in .env.local for real functionality.
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, Demo User
              </span>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                        {tab.id === 'draft' && draftPosts.length > 0 && (
                          <span className="ml-auto bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                            {draftPosts.length}
                          </span>
                        )}
                        {tab.id === 'schedule' && scheduledPosts.length > 0 && (
                          <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                            {scheduledPosts.length}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                    <p className="text-gray-600">
                      Analytics and insights for your LinkedIn post performance.
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Posts</p>
                          <p className="text-2xl font-bold">{draftPosts.length + scheduledPosts.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Draft Posts</p>
                          <p className="text-2xl font-bold">{draftPosts.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-green-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Scheduled</p>
                          <p className="text-2xl font-bold">{scheduledPosts.length}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-purple-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Ready to Publish</p>
                          <p className="text-2xl font-bold">{scheduledPosts.filter(isPostReadyToPublish).length}</p>
                        </div>
                        <Send className="w-8 h-8 text-orange-200" />
                      </div>
                    </div>
                  </div>

                  {/* Streak Card */}
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-orange-50 to-red-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-3">
                          <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Posting Streak</h3>
                          <p className="text-sm text-gray-600">Keep the momentum going!</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">{streakData.currentStreak}</div>
                        <div className="text-sm text-gray-600">days</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="text-sm text-gray-600 mb-1">Current Streak</div>
                        <div className="text-xl font-bold text-orange-600">{streakData.currentStreak} days</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
                        <div className="text-xl font-bold text-purple-600">{streakData.longestStreak} days</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="text-sm text-gray-600 mb-1">Total Posts</div>
                        <div className="text-xl font-bold text-blue-600">{streakData.totalPosts}</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Last Activity</span>
                        <span className="text-xs text-gray-500">
                          {new Date(streakData.lastActivityDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((streakData.currentStreak / 30) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 days</span>
                        <span>30 days</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-800">
                          {streakData.currentStreak >= 7 
                            ? `🔥 Amazing! You're on a ${streakData.currentStreak}-day streak! Keep it up!`
                            : streakData.currentStreak >= 3
                            ? `🔥 Great start! You're building momentum with a ${streakData.currentStreak}-day streak!`
                            : `🔥 Start your streak today! Create a post to begin your journey!`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coming Soon Features */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Analytics Coming Soon */}
                    <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Post Analytics</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Coming Soon</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Total Views</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Engagement Rate</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Click-through Rate</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Track your post performance with detailed analytics and insights.
                      </p>
                    </div>

                    {/* Audience Insights Coming Soon */}
                    <div className="border rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Audience Insights</h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Coming Soon</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Follower Growth</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Top Demographics</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Peak Activity Times</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Understand your audience better with demographic and behavioral data.
                      </p>
                    </div>

                    {/* Content Performance Coming Soon */}
                    <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-violet-50">
                      <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Content Performance</h3>
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Coming Soon</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Best Performing Topics</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Optimal Posting Times</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Content Recommendations</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Get AI-powered recommendations for better content performance.
                      </p>
                    </div>

                    {/* Team Collaboration Coming Soon */}
                    <div className="border rounded-lg p-6 bg-gradient-to-br from-orange-50 to-amber-50">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="w-6 h-6 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Coming Soon</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Team Members</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Approval Workflow</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="text-sm text-gray-600">Content Calendar</span>
                          <span className="text-lg font-semibold text-gray-900">--</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Collaborate with your team on content creation and approval.
                      </p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Post scheduled for tomorrow at 9:00 AM</span>
                        <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">New draft created: "Remote Work Success"</span>
                        <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Post published successfully</span>
                        <span className="text-xs text-gray-400 ml-auto">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Post Tab */}
              {activeTab === 'create' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Post</h2>
                    <p className="text-gray-600">
                      Generate LinkedIn posts with AI assistance based on your topic and preferred tone.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input Form */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                          Topic
                        </label>
                        <textarea
                          id="topic"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="Enter your post topic (e.g., 'AI in business', 'Remote work tips', 'Industry insights')"
                          className="input-field h-32 resize-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                          Tone
                        </label>
                        <select
                          id="tone"
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="input-field"
                        >
                          {tones.map((toneOption) => (
                            <option key={toneOption.value} value={toneOption.value}>
                              {toneOption.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={generatePost}
                        disabled={loading || !topic.trim()}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="w-5 h-5" />
                        {loading ? 'Generating...' : 'Generate Post'}
                      </button>
                    </div>

                    {/* Generated Post */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Generated Post
                      </label>
                      <div className="relative">
                        <textarea
                          value={generatedPost}
                          onChange={(e) => setGeneratedPost(e.target.value)}
                          placeholder="Your generated post will appear here..."
                          className="input-field h-64 resize-none"
                          readOnly={!generatedPost}
                        />
                        {generatedPost && (
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={saveAsDraft}
                              className="btn-secondary flex items-center gap-2 text-sm"
                            >
                              <Save className="w-4 h-4" />
                              Save as Draft
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {generatedPost && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">Preview</h3>
                      <div className="bg-white rounded border p-4 text-sm text-gray-700 whitespace-pre-wrap mb-4">
                        {generatedPost}
                      </div>
                      
                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={saveAsDraft}
                          className="btn-secondary flex items-center justify-center gap-2 flex-1"
                        >
                          <Save className="w-4 h-4" />
                          Save as Draft
                        </button>
                        
                        <button
                          onClick={() => {
                            // Load the current post for scheduling
                            setActiveTab('schedule')
                            // The post is already in generatedPost state, so it will show in the scheduling interface
                            toast.success('Post loaded for scheduling! Select date and time to schedule.')
                          }}
                          className="btn-primary flex items-center justify-center gap-2 flex-1"
                        >
                          <Calendar className="w-4 h-4" />
                          Schedule Post
                        </button>
                        
                        <button
                          onClick={() => {
                            // Simulate publishing
                            toast.success('Post published successfully!')
                            setGeneratedPost('')
                            setTopic('')
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 flex-1"
                        >
                          <Send className="w-4 h-4" />
                          Ready to Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Draft Tab */}
              {activeTab === 'draft' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Draft Posts</h2>
                    <p className="text-gray-600">
                      Manage your saved draft posts. Edit, delete, or schedule them for publishing.
                    </p>
                  </div>

                  {draftPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Draft Posts</h3>
                      <p className="text-gray-600 mb-4">
                        Create your first post to see it here as a draft.
                      </p>
                      <button 
                        onClick={() => setActiveTab('create')}
                        className="btn-primary"
                      >
                        Create Post
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {draftPosts.map((draft) => (
                        <div key={draft.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Created: {new Date(draft.created_at).toLocaleDateString()} at {new Date(draft.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="bg-white rounded border p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {draft.content}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => editDraft(draft.id)}
                              className="btn-primary flex items-center gap-2 text-sm"
                            >
                              <FileText className="w-4 h-4" />
                              Edit Draft
                            </button>
                            <button
                              onClick={() => scheduleFromDraftTab(draft.id)}
                              className="btn-secondary flex items-center gap-2 text-sm"
                            >
                              <Calendar className="w-4 h-4" />
                              Schedule
                            </button>
                            <button
                              onClick={() => deleteDraft(draft.id)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-2 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Posts</h2>
                    <p className="text-gray-600">
                      Schedule your draft posts for automatic publishing at specific times.
                    </p>
                  </div>

                  {/* Scheduling Interface */}
                  {generatedPost && (
                    <div className="border rounded-lg p-6 bg-blue-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule This Post</h3>
                      <div className="bg-white rounded border p-4 mb-4">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {generatedPost}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="input-field text-sm"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <input
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="input-field text-sm"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!selectedDate || !selectedTime) {
                              toast.error('Please select both date and time')
                              return
                            }
                            // Create a temporary draft and schedule it
                            const tempDraft = {
                              id: `temp-${Date.now()}`,
                              content: generatedPost,
                              created_at: new Date().toISOString()
                            }
                            scheduleDraft(tempDraft.id)
                          }}
                          disabled={scheduling === 'temp-draft' || !selectedDate || !selectedTime}
                          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                        >
                          <Calendar className="w-4 h-4" />
                          {scheduling === 'temp-draft' ? 'Scheduling...' : 'Schedule Post'}
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        💡 <strong>Tip:</strong> Select a future date and time to schedule your post for automatic publishing.
                      </div>
                    </div>
                  )}

                  {/* Draft Posts to Schedule */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Draft Posts Available for Scheduling</h3>
                    {draftPosts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No draft posts available</p>
                        <p className="text-sm">Create a post first to schedule it</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {draftPosts.map((draft) => (
                          <div key={draft.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-2">
                                  Created: {new Date(draft.created_at).toLocaleDateString()}
                                </p>
                                <div className="bg-white rounded border p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                  {draft.content}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <input
                                  type="date"
                                  value={selectedDate}
                                  onChange={(e) => setSelectedDate(e.target.value)}
                                  className="input-field text-sm"
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <input
                                  type="time"
                                  value={selectedTime}
                                  onChange={(e) => setSelectedTime(e.target.value)}
                                  className="input-field text-sm"
                                />
                              </div>
                              <button
                                onClick={() => scheduleDraft(draft.id)}
                                disabled={scheduling === draft.id || !selectedDate || !selectedTime}
                                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                              >
                                <Calendar className="w-4 h-4" />
                                {scheduling === draft.id ? 'Scheduling...' : 'Schedule'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scheduled Posts */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Posts</h3>
                    {scheduledPosts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No scheduled posts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {scheduledPosts.map((post) => (
                          <div key={post.id} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-900">
                                    Scheduled for: {new Date(post.schedule_time).toLocaleString()}
                                  </span>
                                </div>
                                <div className="bg-white rounded border p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                  {post.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Publish Tab */}
              {activeTab === 'publish' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Publish Posts</h2>
                    <p className="text-gray-600">
                      Publish your scheduled posts or publish them immediately.
                    </p>
                  </div>

                  {/* Ready to Publish */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Publish</h3>
                    {scheduledPosts.filter(isPostReadyToPublish).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No posts ready to publish</p>
                        <p className="text-sm">Posts will appear here when their scheduled time arrives</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {scheduledPosts
                          .filter(isPostReadyToPublish)
                          .map((post) => (
                            <div key={post.id} className="border rounded-lg p-4 bg-green-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">
                                      Ready to publish (was scheduled for: {new Date(post.schedule_time).toLocaleString()})
                                    </span>
                                  </div>
                                  <div className="bg-white rounded border p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                    {post.content}
                                  </div>
                                </div>
                                <button
                                  onClick={() => publishPost(post.id)}
                                  className="btn-primary flex items-center gap-2 text-sm ml-4"
                                >
                                  <Send className="w-4 h-4" />
                                  Publish Now
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Future Scheduled Posts */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Future Scheduled Posts</h3>
                    {scheduledPosts.filter(post => !isPostReadyToPublish(post)).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No future scheduled posts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {scheduledPosts
                          .filter(post => !isPostReadyToPublish(post))
                          .map((post) => (
                            <div key={post.id} className="border rounded-lg p-4 bg-blue-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                      Scheduled for: {new Date(post.schedule_time).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="bg-white rounded border p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                    {post.content}
                                  </div>
                                </div>
                                <button
                                  onClick={() => publishPost(post.id)}
                                  className="btn-secondary flex items-center gap-2 text-sm ml-4"
                                >
                                  <Send className="w-4 h-4" />
                                  Publish Early
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
