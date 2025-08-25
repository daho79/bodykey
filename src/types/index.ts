export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  height: number // in inches
  targetWeight: number // in lbs
  currentWeight: number // in lbs
  dateJoined: Date
}

export interface WeightEntry {
  id: string
  userId: string
  weight: number // in lbs
  date: Date
  calories?: number
  exercise?: string
  waterIntake?: number // in oz
  notes?: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  targetWeight: number
  targetDate: Date
  type: 'weekly' | 'monthly' | 'yearly'
  isActive: boolean
  createdAt: Date
}

export interface MotivationalContent {
  id: string
  type: 'quote' | 'tip'
  content: string
  author?: string
  category: 'nutrition' | 'exercise' | 'mindset' | 'general'
}

export interface WeeklyProgress {
  weekStart: Date
  weekEnd: Date
  startWeight: number
  endWeight: number
  weightChange: number
  entries: WeightEntry[]
}