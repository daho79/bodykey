'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { 
  Plus,
  Target,
  Calendar,
  Trophy,
  Clock,
  Edit3,
  Trash2,
  CheckCircle
} from 'lucide-react'
import { Goal, User } from '@/types'
import { formatWeight, formatDate } from '@/lib/utils'

export default function GoalsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetWeight: '',
    targetDate: '',
    type: 'monthly' as 'weekly' | 'monthly' | 'yearly'
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

    // Load existing goals
    const savedGoals = localStorage.getItem('userGoals')
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
        ...goal,
        targetDate: new Date(goal.targetDate),
        createdAt: new Date(goal.createdAt)
      }))
      setGoals(parsedGoals)
    }
  }, [router])

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetWeight || !newGoal.targetDate || !user) return

    const goal: Goal = {
      id: Date.now().toString(),
      userId: user.email,
      title: newGoal.title,
      targetWeight: parseFloat(newGoal.targetWeight),
      targetDate: new Date(newGoal.targetDate),
      type: newGoal.type,
      isActive: true,
      createdAt: new Date()
    }

    const updatedGoals = [...goals, goal]
    setGoals(updatedGoals)
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals))

    // Reset form
    setNewGoal({
      title: '',
      targetWeight: '',
      targetDate: '',
      type: 'monthly'
    })
    setShowAddGoal(false)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setNewGoal({
      title: goal.title,
      targetWeight: goal.targetWeight.toString(),
      targetDate: goal.targetDate.toISOString().split('T')[0],
      type: goal.type
    })
    setShowAddGoal(true)
  }

  const handleUpdateGoal = () => {
    if (!editingGoal || !newGoal.title || !newGoal.targetWeight || !newGoal.targetDate) return

    const updatedGoal: Goal = {
      ...editingGoal,
      title: newGoal.title,
      targetWeight: parseFloat(newGoal.targetWeight),
      targetDate: new Date(newGoal.targetDate),
      type: newGoal.type
    }

    const updatedGoals = goals.map(goal => 
      goal.id === editingGoal.id ? updatedGoal : goal
    )
    setGoals(updatedGoals)
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals))

    // Reset form
    setNewGoal({
      title: '',
      targetWeight: '',
      targetDate: '',
      type: 'monthly'
    })
    setShowAddGoal(false)
    setEditingGoal(null)
  }

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    setGoals(updatedGoals)
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals))
  }

  const toggleGoalStatus = (goalId: string) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal
    )
    setGoals(updatedGoals)
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals))
  }

  const getGoalProgress = (goal: Goal) => {
    if (!user) return 0

    const currentWeight = user.currentWeight
    const startWeight = user.currentWeight // In a real app, this would be the weight when goal was created
    const targetWeight = goal.targetWeight
    
    if (startWeight === targetWeight) return 100
    
    const totalProgress = Math.abs(startWeight - targetWeight)
    const currentProgress = Math.abs(startWeight - currentWeight)
    
    return Math.min(100, (currentProgress / totalProgress) * 100)
  }

  const isGoalCompleted = (goal: Goal) => {
    if (!user) return false
    
    if (goal.targetWeight <= user.currentWeight) {
      return user.currentWeight <= goal.targetWeight
    } else {
      return user.currentWeight >= goal.targetWeight
    }
  }

  const getDaysUntilDeadline = (targetDate: Date) => {
    const today = new Date()
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const activeGoals = goals.filter(goal => goal.isActive)
  const completedGoals = goals.filter(goal => !goal.isActive || isGoalCompleted(goal))

  return (
    <>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Goals</h1>
            <p className="text-gray-600">
              Set and track your weight management targets to stay motivated.
            </p>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Goal</span>
          </button>
        </div>

        {/* Add/Edit Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Lose 10 pounds"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Weight (lbs)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newGoal.targetWeight}
                    onChange={(e) => setNewGoal({ ...newGoal, targetWeight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Target weight"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Type
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Weekly Goal</option>
                    <option value="monthly">Monthly Goal</option>
                    <option value="yearly">Yearly Goal</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowAddGoal(false)
                    setEditingGoal(null)
                    setNewGoal({ title: '', targetWeight: '', targetDate: '', type: 'monthly' })
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                  disabled={!newGoal.title || !newGoal.targetWeight || !newGoal.targetDate}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Goals */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Goals</h2>
            {activeGoals.length > 0 ? (
              <div className="space-y-4">
                {activeGoals.map((goal) => {
                  const progress = getGoalProgress(goal)
                  const isCompleted = isGoalCompleted(goal)
                  const daysLeft = getDaysUntilDeadline(goal.targetDate)
                  
                  return (
                    <div key={goal.id} className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                            {isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>{formatWeight(goal.targetWeight)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(goal.targetDate)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium text-gray-900">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Goal Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Current</p>
                          <p className="font-semibold text-gray-900">{formatWeight(user.currentWeight)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Target</p>
                          <p className="font-semibold text-gray-900">{formatWeight(goal.targetWeight)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Remaining</p>
                          <p className="font-semibold text-gray-900">
                            {Math.abs(user.currentWeight - goal.targetWeight).toFixed(1)} lbs
                          </p>
                        </div>
                      </div>

                      {isCompleted && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-5 h-5 text-green-600" />
                            <span className="text-green-800 font-medium">Goal Completed!</span>
                          </div>
                          <p className="text-green-700 text-sm mt-1">
                            Congratulations on reaching your target weight!
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Goals</h3>
                <p className="text-gray-600 mb-4">
                  Set your first weight management goal to start tracking progress.
                </p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Goal
                </button>
              </div>
            )}
          </div>

          {/* Completed Goals & Tips */}
          <div className="space-y-6">
            {/* Completed Goals */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Completed Goals</h2>
              {completedGoals.length > 0 ? (
                <div className="space-y-4">
                  {completedGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Trophy className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-green-900">{goal.title}</h4>
                      </div>
                      <div className="flex items-center justify-between text-sm text-green-700">
                        <span>Target: {formatWeight(goal.targetWeight)}</span>
                        <span>Completed: {formatDate(goal.targetDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600">No completed goals yet</p>
                </div>
              )}
            </div>

            {/* Goal Setting Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Setting Tips</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Set specific, measurable targets (e.g., "lose 5 pounds" instead of "lose weight")</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Choose realistic timeframes - aim for 1-2 pounds per week</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Break larger goals into smaller milestones for better motivation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Review and adjust your goals regularly based on your progress</span>
                </li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{activeGoals.length}</p>
                  <p className="text-sm text-gray-600">Active Goals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}