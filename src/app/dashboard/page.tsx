'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { 
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  Droplets,
  Activity,
  Apple
} from 'lucide-react'
import { WeightEntry, User } from '@/types'
import { formatDate, formatWeight, calculateBMI, getBMICategory } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [newEntry, setNewEntry] = useState({
    weight: '',
    calories: '',
    exercise: '',
    waterIntake: '',
    notes: ''
  })

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

  const handleAddEntry = () => {
    if (!newEntry.weight || !user) return

    const entry: WeightEntry = {
      id: Date.now().toString(),
      userId: user.email,
      weight: parseFloat(newEntry.weight),
      date: currentDate,
      calories: newEntry.calories ? parseInt(newEntry.calories) : undefined,
      exercise: newEntry.exercise || undefined,
      waterIntake: newEntry.waterIntake ? parseInt(newEntry.waterIntake) : undefined,
      notes: newEntry.notes || undefined
    }

    const updatedEntries = [...entries, entry].sort((a, b) => b.date.getTime() - a.date.getTime())
    setEntries(updatedEntries)
    localStorage.setItem('weightEntries', JSON.stringify(updatedEntries))

    // Update user's current weight
    const updatedUser = { ...user, currentWeight: entry.weight }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))

    // Reset form
    setNewEntry({
      weight: '',
      calories: '',
      exercise: '',
      waterIntake: '',
      notes: ''
    })
    setShowAddEntry(false)
  }

  const getWeightChange = () => {
    if (entries.length < 2) return { change: 0, isPositive: true }
    
    const latest = entries[0]
    const previous = entries[1]
    const change = latest.weight - previous.weight
    
    return {
      change: Math.abs(change),
      isPositive: change <= 0 // Weight loss is positive for health goals
    }
  }

  const getThisWeekEntries = () => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    weekStart.setHours(0, 0, 0, 0)
    
    return entries.filter(entry => entry.date >= weekStart)
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const hasEntry = entries.some(entry => 
        entry.date.toDateString() === date.toDateString()
      )
      days.push({ date, hasEntry })
    }
    
    return days
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const weightChange = getWeightChange()
  const thisWeekEntries = getThisWeekEntries()
  const currentBMI = calculateBMI(user.currentWeight, user.height)
  const bmiCategory = getBMICategory(currentBMI)

  return (
    <>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Track your progress and stay motivated on your weight management journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Weight */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Weight</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatWeight(user.currentWeight)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Weight Change */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Weight Change</p>
                <p className={`text-2xl font-bold ${weightChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {weightChange.isPositive ? '-' : '+'}{weightChange.change.toFixed(1)} lbs
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                weightChange.isPositive ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {weightChange.isPositive ? (
                  <TrendingDown className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          {/* Target Weight */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Target Weight</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatWeight(user.targetWeight)}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.abs(user.currentWeight - user.targetWeight).toFixed(1)} lbs to go
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Minus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* BMI */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">BMI</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentBMI.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">{bmiCategory}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Add Entry */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Log Entry</h2>
                <button
                  onClick={() => setShowAddEntry(!showAddEntry)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {showAddEntry && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (lbs) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newEntry.weight}
                      onChange={(e) => setNewEntry({ ...newEntry, weight: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter weight"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calories
                    </label>
                    <div className="relative">
                      <Apple className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={newEntry.calories}
                        onChange={(e) => setNewEntry({ ...newEntry, calories: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Daily calories"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water Intake (oz)
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={newEntry.waterIntake}
                        onChange={(e) => setNewEntry({ ...newEntry, waterIntake: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Water intake"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exercise
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={newEntry.exercise}
                        onChange={(e) => setNewEntry({ ...newEntry, exercise: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Exercise activity"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>

                  <button
                    onClick={handleAddEntry}
                    disabled={!newEntry.weight}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Entry
                  </button>
                </div>
              )}
            </div>

            {/* This Week's Entries */}
            <div className="bg-white rounded-xl p-6 shadow-lg mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
              {thisWeekEntries.length > 0 ? (
                <div className="space-y-3">
                  {thisWeekEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{formatWeight(entry.weight)}</p>
                        <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                      </div>
                      {entry.calories && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{entry.calories} cal</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No entries this week</p>
              )}
            </div>
          </div>

          {/* Calendar View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Calendar View</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <span className="font-medium text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square p-2 text-center relative ${
                      day ? 'hover:bg-gray-50 cursor-pointer' : ''
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`text-sm ${
                          day.date.toDateString() === new Date().toDateString()
                            ? 'font-bold text-blue-600'
                            : 'text-gray-900'
                        }`}>
                          {day.date.getDate()}
                        </span>
                        {day.hasEntry && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Logged entry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}