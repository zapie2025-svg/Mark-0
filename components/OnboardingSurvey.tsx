'use client'

import { useState } from 'react'
import { X, User, Target, Briefcase, TrendingUp, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface OnboardingSurveyProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (surveyData: SurveyData) => void
}

interface SurveyData {
  currentRole: string
  industry: string
  experience: string
  goals: string[]
  contentPreferences: string[]
}

const goals = [
  { id: 'personal-branding', label: 'Personal Branding', icon: User, description: 'Build your personal brand and online presence' },
  { id: 'get-job', label: 'Get a Job', icon: Briefcase, description: 'Find new career opportunities and job prospects' },
  { id: 'establish-leadership', label: 'Establish as Leader', icon: TrendingUp, description: 'Position yourself as a thought leader in your field' },
  { id: 'network-growth', label: 'Network Growth', icon: User, description: 'Expand your professional network and connections' },
  { id: 'skill-development', label: 'Skill Development', icon: Target, description: 'Showcase and develop your professional skills' }
]

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 
  'Consulting', 'Manufacturing', 'Retail', 'Real Estate', 'Legal', 'Media',
  'Non-profit', 'Government', 'Other'
]

const experienceLevels = [
  'Student/Entry Level', '1-3 years', '4-7 years', '8-12 years', '13+ years', 'Executive'
]

const contentPreferences = [
  'Industry insights and trends',
  'Personal career stories',
  'Professional tips and advice',
  'Thought leadership content',
  'Behind-the-scenes work life',
  'Networking and community building'
]

export default function OnboardingSurvey({ isOpen, onClose, onComplete }: OnboardingSurveyProps) {
  const [step, setStep] = useState(1)
  const [surveyData, setSurveyData] = useState<SurveyData>({
    currentRole: '',
    industry: '',
    experience: '',
    goals: [],
    contentPreferences: []
  })

  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    )
  }

  const handleNext = () => {
    if (step === 1 && !surveyData.currentRole.trim()) {
      toast.error('Please enter your current role')
      return
    }
    if (step === 2 && !surveyData.industry) {
      toast.error('Please select your industry')
      return
    }
    if (step === 3 && !surveyData.experience) {
      toast.error('Please select your experience level')
      return
    }
    if (step === 4 && selectedGoals.length === 0) {
      toast.error('Please select at least one goal')
      return
    }
    if (step === 5 && selectedPreferences.length === 0) {
      toast.error('Please select at least one content preference')
      return
    }

    if (step < 5) {
      setStep(step + 1)
    } else {
      // Complete survey
      const finalData = {
        ...surveyData,
        goals: selectedGoals,
        contentPreferences: selectedPreferences
      }
      onComplete(finalData)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const updateSurveyData = (field: keyof SurveyData, value: string) => {
    setSurveyData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome to Mark.0!</h2>
            <p className="text-gray-600">Let's personalize your experience</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex-1 h-2 rounded-full ${
                  stepNumber <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {step} of 5</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What's your current role?</h3>
                <p className="text-gray-600 mb-4">This helps us understand your professional background</p>
                <input
                  type="text"
                  value={surveyData.currentRole}
                  onChange={(e) => updateSurveyData('currentRole', e.target.value)}
                  placeholder="e.g., Software Engineer, Marketing Manager, Consultant"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What industry do you work in?</h3>
                <p className="text-gray-600 mb-4">Select the industry that best describes your work</p>
                <select
                  value={surveyData.industry}
                  onChange={(e) => updateSurveyData('industry', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How much experience do you have?</h3>
                <p className="text-gray-600 mb-4">This helps us tailor content to your career stage</p>
                <select
                  value={surveyData.experience}
                  onChange={(e) => updateSurveyData('experience', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What are your main goals?</h3>
                <p className="text-gray-600 mb-4">Select all that apply (you can choose multiple)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {goals.map((goal) => {
                    const Icon = goal.icon
                    const isSelected = selectedGoals.includes(goal.id)
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleGoalToggle(goal.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{goal.label}</h4>
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What type of content do you prefer?</h3>
                <p className="text-gray-600 mb-4">Select the content types you'd like to create</p>
                <div className="space-y-3">
                  {contentPreferences.map((preference) => {
                    const isSelected = selectedPreferences.includes(preference)
                    return (
                      <button
                        key={preference}
                        onClick={() => handlePreferenceToggle(preference)}
                        className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">{preference}</span>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {step === 5 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
