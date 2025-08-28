'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, Plus, Calendar, Send, BarChart3, TrendingUp, Users, Eye, Flame, Edit } from 'lucide-react'
import CreatePostTab from './CreatePostTab'
import ScheduleTab from './ScheduleTab'
import PublishTab from './PublishTab'
import DraftTab from './DraftTab'
import LinkedInAnalyticsCard from './LinkedInAnalyticsCard'
import LinkedInOAuthTest from './LinkedInOAuthTest'

import toast from 'react-hot-toast'

type TabType = 'dashboard' | 'create' | 'draft' | 'schedule' | 'publish'

interface DashboardProps {
  user: any
}

interface Post {
  id: string
  content: string
  status: 'draft' | 'scheduled' | 'published'
  created_at: string
  schedule_time?: string
}

interface UserStreak {
  current_streak: number
  longest_streak: number
  total_posts: number
  last_activity_date: string
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [posts, setPosts] = useState<Post[]>([])
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      // Fetch user streak
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (streakError && streakError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Streak fetch error:', streakError)
      }

      setPosts(postsData || [])
      setUserStreak(streakData)
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Refresh dashboard data
  const refreshDashboard = () => {
    fetchUserData()
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logged out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout')
    }
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'create' as TabType, label: 'Create Post', icon: Plus },
    { id: 'draft' as TabType, label: 'Draft', icon: Edit },
    { id: 'schedule' as TabType, label: 'Schedule', icon: Calendar },
    { id: 'publish' as TabType, label: 'Publish', icon: Send },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                LinkedIn Post Automation
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url && (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.user_metadata?.email || user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
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
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading dashboard data...</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Hey {user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0] || 'there'} 👋🏻
                        </h2>
                        <p className="text-gray-600">
                          Welcome back! Here's your LinkedIn posting overview.
                        </p>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500 rounded-full p-2">
                              <Plus className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-blue-600">Total Posts</div>
                              <div className="text-xl font-bold text-blue-900">{posts.length}</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-500 rounded-full p-2">
                              <Send className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-green-600">Published</div>
                              <div className="text-xl font-bold text-green-900">
                                {posts.filter(post => post.status === 'published').length}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-yellow-500 rounded-full p-2">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-yellow-600">Scheduled</div>
                              <div className="text-xl font-bold text-yellow-900">
                                {posts.filter(post => post.status === 'scheduled').length}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-500 rounded-full p-2">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-purple-600">Drafts</div>
                              <div className="text-xl font-bold text-purple-900">
                                {posts.filter(post => post.status === 'draft').length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                                                      {/* LinkedIn Analytics Card */}
                        <LinkedInAnalyticsCard />
                        
                        {/* LinkedIn OAuth Debug */}
                        <LinkedInOAuthTest />
                        
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
                            <div className="text-2xl font-bold text-orange-600">
                              {userStreak?.current_streak || 0}
                            </div>
                            <div className="text-sm text-gray-600">days</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-4 border">
                            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
                            <div className="text-xl font-bold text-orange-600">
                              {userStreak?.current_streak || 0} days
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border">
                            <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
                            <div className="text-xl font-bold text-purple-600">
                              {userStreak?.longest_streak || 0} days
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border">
                            <div className="text-sm text-gray-600 mb-1">Total Posts</div>
                            <div className="text-xl font-bold text-blue-600">
                              {userStreak?.total_posts || posts.length}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Last Activity</span>
                            <span className="text-xs text-gray-500">
                              {userStreak?.last_activity_date 
                                ? new Date(userStreak.last_activity_date).toLocaleDateString()
                                : 'No activity yet'
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(((userStreak?.current_streak || 0) / 30) * 100, 100)}%` }}
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
                              {userStreak?.current_streak === 0 
                                ? '🔥 Start your streak today! Create a post to begin your journey!'
                                : (userStreak?.current_streak || 0) >= 7
                                ? `🔥 Amazing! You're on a ${userStreak?.current_streak}-day streak! Keep it up!`
                                : `🔥 Great start! You're building momentum with a ${userStreak?.current_streak || 0}-day streak!`
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Coming Soon Features */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-500 rounded-full p-2">
                              <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Post Analytics</h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Track engagement, reach, and performance metrics for your LinkedIn posts.
                          </p>
                          <div className="text-sm text-blue-600 font-medium">Coming Soon</div>
                        </div>

                        <div className="border rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-500 rounded-full p-2">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Audience Insights</h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Understand your audience demographics and engagement patterns.
                          </p>
                          <div className="text-sm text-green-600 font-medium">Coming Soon</div>
                        </div>

                        <div className="border rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-500 rounded-full p-2">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Content Performance</h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Analyze which content types perform best and optimize your strategy.
                          </p>
                          <div className="text-sm text-purple-600 font-medium">Coming Soon</div>
                        </div>

                        <div className="border rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-orange-500 rounded-full p-2">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Collaborate with team members on content creation and approval workflows.
                          </p>
                          <div className="text-sm text-orange-600 font-medium">Coming Soon</div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          {posts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p>No posts yet. Create your first post to get started!</p>
                            </div>
                          ) : (
                            posts.slice(0, 5).map((post) => {
                              const getStatusIcon = () => {
                                switch (post.status) {
                                  case 'published':
                                    return <Send className="w-3 h-3 text-white" />
                                  case 'scheduled':
                                    return <Calendar className="w-3 h-3 text-white" />
                                  case 'draft':
                                    return <Plus className="w-3 h-3 text-white" />
                                  default:
                                    return <Plus className="w-3 h-3 text-white" />
                                }
                              }

                              const getStatusColor = () => {
                                switch (post.status) {
                                  case 'published':
                                    return 'bg-green-500'
                                  case 'scheduled':
                                    return 'bg-blue-500'
                                  case 'draft':
                                    return 'bg-yellow-500'
                                  default:
                                    return 'bg-gray-500'
                                }
                              }

                              const getStatusText = () => {
                                switch (post.status) {
                                  case 'published':
                                    return 'Post published'
                                  case 'scheduled':
                                    return 'Post scheduled'
                                  case 'draft':
                                    return 'Draft created'
                                  default:
                                    return 'Post created'
                                }
                              }

                              const formatDate = (dateString: string) => {
                                const date = new Date(dateString)
                                const now = new Date()
                                const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
                                
                                if (diffInHours < 1) return 'Just now'
                                if (diffInHours < 24) return `${diffInHours} hours ago`
                                if (diffInHours < 48) return '1 day ago'
                                return `${Math.floor(diffInHours / 24)} days ago`
                              }

                              const getPostPreview = (content: string) => {
                                return content.length > 50 ? content.substring(0, 50) + '...' : content
                              }

                              return (
                                <div key={post.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <div className={`${getStatusColor()} rounded-full p-1`}>
                                    {getStatusIcon()}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{getStatusText()}</div>
                                    <div className="text-xs text-gray-500">
                                      "{getPostPreview(post.content)}" - {formatDate(post.created_at)}
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                              )}
                {activeTab === 'create' && <CreatePostTab user={user} onPostCreated={refreshDashboard} />}
                {activeTab === 'draft' && <DraftTab user={user} onPostUpdated={refreshDashboard} />}
                {activeTab === 'schedule' && <ScheduleTab user={user} onPostUpdated={refreshDashboard} />}
                {activeTab === 'publish' && <PublishTab user={user} onPostUpdated={refreshDashboard} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
