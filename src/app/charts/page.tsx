'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import WeightChart from '@/components/WeightChart'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Activity
} from 'lucide-react'
import { WeightEntry, User } from '@/types'
import { formatWeight, getWeekStartDate } from '@/lib/utils'

export default function ChartsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Load existing entries
    const savedEntries = localStorage.getItem('weightEntries')
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }))
      setEntries(parsedEntries)
    }
  }, [router])

  const getFilteredEntries = () => {
    if (entries.length === 0) return []

    const now = new Date()
    let startDate: Date

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    return entries.filter(entry => entry.date >= startDate)
  }

  const getWeeklyProgress = () => {
    const weeklyData: { [key: string]: WeightEntry[] } = {}
    
    entries.forEach(entry => {
      const weekStart = getWeekStartDate(entry.date)
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = []
      }
      weeklyData[weekKey].push(entry)
    })

    return Object.entries(weeklyData).map(([weekKey, weekEntries]) => {
      const weights = weekEntries.map(e => e.weight)
      const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length
      
      return {
        week: new Date(weekKey),
        averageWeight: avgWeight,
        entries: weekEntries.length
      }
    }).sort((a, b) => a.week.getTime() - b.week.getTime())
  }

  const getProgressStats = () => {
    const filteredEntries = getFilteredEntries()
    if (filteredEntries.length < 2) return null

    const sortedEntries = filteredEntries.sort((a, b) => a.date.getTime() - b.date.getTime())
    const firstEntry = sortedEntries[0]
    const lastEntry = sortedEntries[sortedEntries.length - 1]
    
    const weightChange = lastEntry.weight - firstEntry.weight
    const timeSpan = Math.ceil((lastEntry.date.getTime() - firstEntry.date.getTime()) / (1000 * 60 * 60 * 24))
    const averageChangePerDay = weightChange / timeSpan

    return {
      totalChange: weightChange,
      timeSpan,
      averageChangePerDay,
      entriesCount: filteredEntries.length
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const filteredEntries = getFilteredEntries()
  const weeklyProgress = getWeeklyProgress()
  const progressStats = getProgressStats()

  return (
    <>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Visualization</h1>
          <p className="text-gray-600">
            Track your weight management journey with detailed charts and analytics.
          </p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'week', label: '7 Days' },
              { key: 'month', label: '30 Days' },
              { key: 'quarter', label: '3 Months' },
              { key: 'year', label: '1 Year' }
            ].map(period => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Stats */}
        {progressStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Change</p>
                  <p className={`text-2xl font-bold ${
                    progressStats.totalChange <= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {progressStats.totalChange > 0 ? '+' : ''}{progressStats.totalChange.toFixed(1)} lbs
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  progressStats.totalChange <= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {progressStats.totalChange <= 0 ? (
                    <TrendingDown className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Daily Average</p>
                  <p className={`text-2xl font-bold ${
                    progressStats.averageChangePerDay <= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {progressStats.averageChangePerDay > 0 ? '+' : ''}{progressStats.averageChangePerDay.toFixed(2)} lbs
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time Period</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressStats.timeSpan} days
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Entries Logged</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressStats.entriesCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-1 gap-8">
          {/* Weight Progress Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Weight Progress</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Current Weight</span>
                </div>
                {user.targetWeight && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-green-500 border-dashed rounded-full"></div>
                    <span className="text-sm text-gray-600">Target Weight</span>
                  </div>
                )}
              </div>
            </div>
            <WeightChart entries={filteredEntries} targetWeight={user.targetWeight} />
          </div>

          {/* Weekly Summary */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Summary</h2>
            {weeklyProgress.length > 0 ? (
              <div className="space-y-4">
                {weeklyProgress.slice(-8).map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Week of {week.week.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {week.entries} {week.entries === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatWeight(week.averageWeight)}
                      </p>
                      <p className="text-sm text-gray-600">avg weight</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No weekly data available</p>
                <p className="text-sm">Start logging regularly to see weekly summaries</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Insights */}
        {progressStats && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Current Trend</h4>
                <p className="text-gray-600">
                  {progressStats.totalChange <= 0 
                    ? `You're on track! You've lost ${Math.abs(progressStats.totalChange).toFixed(1)} lbs over the last ${progressStats.timeSpan} days.`
                    : `You've gained ${progressStats.totalChange.toFixed(1)} lbs over the last ${progressStats.timeSpan} days. Consider reviewing your goals.`
                  }
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Goal Progress</h4>
                <p className="text-gray-600">
                  {user.currentWeight > user.targetWeight 
                    ? `You're ${(user.currentWeight - user.targetWeight).toFixed(1)} lbs away from your target weight of ${user.targetWeight} lbs.`
                    : `Congratulations! You've reached your target weight goal.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}