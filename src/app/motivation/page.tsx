'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { 
  Heart,
  Lightbulb,
  Quote,
  RefreshCw,
  Apple,
  Activity,
  Brain,
  Star
} from 'lucide-react'
import { MotivationalContent } from '@/types'

const motivationalQuotes: MotivationalContent[] = [
  {
    id: '1',
    type: 'quote',
    content: 'The groundwork for all happiness is good health.',
    author: 'Leigh Hunt',
    category: 'general'
  },
  {
    id: '2',
    type: 'quote',
    content: 'Take care of your body. It\'s the only place you have to live.',
    author: 'Jim Rohn',
    category: 'general'
  },
  {
    id: '3',
    type: 'quote',
    content: 'Health is not about the weight you lose, but about the life you gain.',
    author: 'Dr. Josh Axe',
    category: 'mindset'
  },
  {
    id: '4',
    type: 'quote',
    content: 'Every workout is progress, no matter how small.',
    author: 'Unknown',
    category: 'exercise'
  },
  {
    id: '5',
    type: 'quote',
    content: 'You don\'t have to be great to get started, but you have to get started to be great.',
    author: 'Les Brown',
    category: 'mindset'
  }
]

const healthTips: MotivationalContent[] = [
  {
    id: '6',
    type: 'tip',
    content: 'Drink a glass of water before every meal to help control portion sizes and stay hydrated.',
    category: 'nutrition'
  },
  {
    id: '7',
    type: 'tip',
    content: 'Take the stairs instead of the elevator. Small changes in daily activity add up over time.',
    category: 'exercise'
  },
  {
    id: '8',
    type: 'tip',
    content: 'Practice mindful eating by chewing slowly and paying attention to hunger cues.',
    category: 'mindset'
  },
  {
    id: '9',
    type: 'tip',
    content: 'Plan your meals in advance to avoid impulsive food choices and maintain consistent nutrition.',
    category: 'nutrition'
  },
  {
    id: '10',
    type: 'tip',
    content: 'Aim for 7-9 hours of quality sleep each night. Poor sleep can affect hunger hormones and weight management.',
    category: 'general'
  },
  {
    id: '11',
    type: 'tip',
    content: 'Find an exercise buddy or join a fitness community for accountability and motivation.',
    category: 'exercise'
  },
  {
    id: '12',
    type: 'tip',
    content: 'Focus on progress, not perfection. Celebrate small victories along your journey.',
    category: 'mindset'
  },
  {
    id: '13',
    type: 'tip',
    content: 'Keep healthy snacks visible and easily accessible while storing less healthy options out of sight.',
    category: 'nutrition'
  }
]

export default function MotivationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dailyQuote, setDailyQuote] = useState<MotivationalContent | null>(null)
  const [dailyTip, setDailyTip] = useState<MotivationalContent | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))

    // Set daily content based on today's date
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    
    setDailyQuote(motivationalQuotes[dayOfYear % motivationalQuotes.length])
    setDailyTip(healthTips[dayOfYear % healthTips.length])
  }, [router])

  const getRandomContent = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)]
    setDailyQuote(randomQuote)
    setDailyTip(randomTip)
  }

  const getFilteredContent = () => {
    const allContent = [...motivationalQuotes, ...healthTips]
    if (selectedCategory === 'all') return allContent
    return allContent.filter(content => content.category === selectedCategory)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition':
        return Apple
      case 'exercise':
        return Activity
      case 'mindset':
        return Brain
      default:
        return Star
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition':
        return 'bg-green-100 text-green-800'
      case 'exercise':
        return 'bg-blue-100 text-blue-800'
      case 'mindset':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const filteredContent = getFilteredContent()

  return (
    <>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Motivation</h1>
          <p className="text-gray-600">
            Stay inspired and motivated on your weight management journey with daily quotes and helpful tips.
          </p>
        </div>

        {/* Daily Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Daily Quote */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-20">
              <Quote className="w-16 h-16 text-blue-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-blue-900">Quote of the Day</h2>
              </div>
              {dailyQuote && (
                <>
                  <blockquote className="text-lg text-blue-800 mb-4 italic">
                    "{dailyQuote.content}"
                  </blockquote>
                  {dailyQuote.author && (
                    <p className="text-blue-700 font-medium">— {dailyQuote.author}</p>
                  )}
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(dailyQuote.category)}`}>
                      {dailyQuote.category}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Daily Tip */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-20">
              <Lightbulb className="w-16 h-16 text-green-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-green-900">Tip of the Day</h2>
              </div>
              {dailyTip && (
                <>
                  <p className="text-lg text-green-800 mb-4">
                    {dailyTip.content}
                  </p>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(dailyTip.category)}`}>
                      {dailyTip.category}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={getRandomContent}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Get New Inspiration</span>
          </button>
        </div>

        {/* Content Library */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Inspiration Library</h2>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'nutrition', label: 'Nutrition' },
                { key: 'exercise', label: 'Exercise' },
                { key: 'mindset', label: 'Mindset' },
                { key: 'general', label: 'General' }
              ].map(category => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((content) => {
              const IconComponent = getCategoryIcon(content.category)
              return (
                <div key={content.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(content.category)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(content.category)}`}>
                      {content.category}
                    </span>
                  </div>
                  
                  {content.type === 'quote' ? (
                    <>
                      <blockquote className="text-gray-800 mb-3 italic">
                        "{content.content}"
                      </blockquote>
                      {content.author && (
                        <p className="text-gray-600 text-sm font-medium">— {content.author}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-800">
                      {content.content}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Success Stories Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah M.</h4>
                  <p className="text-gray-600 text-sm">Lost 25 lbs in 4 months</p>
                </div>
              </div>
              <p className="text-gray-700">
                "BodyKey helped me stay consistent with my tracking. The visual progress charts kept me motivated even during plateaus. I love how easy it is to log my daily weight and see trends over time."
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mike R.</h4>
                  <p className="text-gray-600 text-sm">Reached target weight in 6 months</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The goal-setting feature was a game changer for me. Breaking down my larger goal into smaller milestones made the journey feel achievable. The daily motivation tips kept me focused."
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Challenge */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">This Week's Challenge</h3>
          </div>
          <p className="text-yellow-800 text-lg mb-4">
            Try to drink 8 glasses of water every day this week and track your energy levels.
          </p>
          <p className="text-yellow-700 text-sm">
            Proper hydration can boost metabolism, reduce hunger, and improve overall well-being. 
            Challenge yourself to maintain this healthy habit!
          </p>
        </div>
      </div>
    </>
  )
}