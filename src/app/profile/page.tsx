'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { 
  User,
  Mail,
  Lock,
  Ruler,
  Target,
  Calendar,
  Save,
  Eye,
  EyeOff,
  LogOut,
  Trash2
} from 'lucide-react'
import { formatWeight, calculateBMI, getBMICategory } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    height: '',
    currentWeight: '',
    targetWeight: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    units: 'imperial', // imperial or metric
    notifications: true,
    weeklyReminders: true,
    shareProgress: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setProfileData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      height: parsedUser.height?.toString() || '',
      currentWeight: parsedUser.currentWeight?.toString() || '',
      targetWeight: parsedUser.targetWeight?.toString() || ''
    })

    // Load preferences
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }
  }, [router])

  const handleProfileSave = () => {
    const newErrors: Record<string, string> = {}

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!profileData.height) {
      newErrors.height = 'Height is required'
    }

    if (!profileData.currentWeight) {
      newErrors.currentWeight = 'Current weight is required'
    }

    if (!profileData.targetWeight) {
      newErrors.targetWeight = 'Target weight is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email,
        height: parseFloat(profileData.height),
        currentWeight: parseFloat(profileData.currentWeight),
        targetWeight: parseFloat(profileData.targetWeight)
      }

      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handlePasswordChange = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // In a real app, this would call an API to change the password
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setSuccessMessage('Password changed successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handlePreferencesSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
    setSuccessMessage('Preferences saved successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('weightEntries')
    localStorage.removeItem('userGoals')
    localStorage.removeItem('userPreferences')
    router.push('/')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.removeItem('user')
      localStorage.removeItem('weightEntries')
      localStorage.removeItem('userGoals')
      localStorage.removeItem('userPreferences')
      router.push('/')
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const currentBMI = user.height && user.currentWeight ? calculateBMI(user.currentWeight, user.height) : 0
  const bmiCategory = getBMICategory(currentBMI)
  const memberSince = user.dateJoined ? new Date(user.dateJoined).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'Recently'

  return (
    <>
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">
            Manage your profile, security settings, and preferences.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* User Avatar */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600 text-sm">{user.email}</p>
                <p className="text-gray-500 text-xs mt-1">Member since {memberSince}</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Current Weight</span>
                  <span className="font-medium text-gray-900">{formatWeight(user.currentWeight)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Target Weight</span>
                  <span className="font-medium text-gray-900">{formatWeight(user.targetWeight)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">BMI</span>
                  <span className="font-medium text-gray-900">{currentBMI.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Category</span>
                  <span className="font-medium text-gray-900">{bmiCategory}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'profile', label: 'Profile', icon: User },
                    { key: 'password', label: 'Password', icon: Lock },
                    { key: 'preferences', label: 'Preferences', icon: Target }
                  ].map(tab => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              !isEditing ? 'bg-gray-50 text-gray-600' : 'border-gray-300'
                            } ${errors.name ? 'border-red-300' : ''}`}
                          />
                        </div>
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              !isEditing ? 'bg-gray-50 text-gray-600' : 'border-gray-300'
                            } ${errors.email ? 'border-red-300' : ''}`}
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>

                      {/* Height */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Height (inches)
                        </label>
                        <div className="relative">
                          <Ruler className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            step="0.1"
                            value={profileData.height}
                            onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              !isEditing ? 'bg-gray-50 text-gray-600' : 'border-gray-300'
                            } ${errors.height ? 'border-red-300' : ''}`}
                          />
                        </div>
                        {errors.height && <p className="mt-1 text-sm text-red-600">{errors.height}</p>}
                      </div>

                      {/* Current Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Weight (lbs)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={profileData.currentWeight}
                          onChange={(e) => setProfileData({ ...profileData, currentWeight: e.target.value })}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            !isEditing ? 'bg-gray-50 text-gray-600' : 'border-gray-300'
                          } ${errors.currentWeight ? 'border-red-300' : ''}`}
                        />
                        {errors.currentWeight && <p className="mt-1 text-sm text-red-600">{errors.currentWeight}</p>}
                      </div>

                      {/* Target Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Weight (lbs)
                        </label>
                        <div className="relative">
                          <Target className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            step="0.1"
                            value={profileData.targetWeight}
                            onChange={(e) => setProfileData({ ...profileData, targetWeight: e.target.value })}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              !isEditing ? 'bg-gray-50 text-gray-600' : 'border-gray-300'
                            } ${errors.targetWeight ? 'border-red-300' : ''}`}
                          />
                        </div>
                        {errors.targetWeight && <p className="mt-1 text-sm text-red-600">{errors.targetWeight}</p>}
                      </div>

                      {/* Join Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Member Since
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={memberSince}
                            disabled
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                          />
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end">
                        <button
                          onClick={handleProfileSave}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                    
                    <div className="space-y-4">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-2.5"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.newPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handlePasswordChange}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
                    
                    <div className="space-y-6">
                      {/* Units */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Measurement Units
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="units"
                              value="imperial"
                              checked={preferences.units === 'imperial'}
                              onChange={(e) => setPreferences({ ...preferences, units: e.target.value as any })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">Imperial (lbs, inches)</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="units"
                              value="metric"
                              checked={preferences.units === 'metric'}
                              onChange={(e) => setPreferences({ ...preferences, units: e.target.value as any })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">Metric (kg, cm)</span>
                          </label>
                        </div>
                      </div>

                      {/* Notifications */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Notifications
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.notifications}
                              onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-700">Enable notifications</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.weeklyReminders}
                              onChange={(e) => setPreferences({ ...preferences, weeklyReminders: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-700">Weekly weigh-in reminders</span>
                          </label>
                        </div>
                      </div>

                      {/* Privacy */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Privacy
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.shareProgress}
                            onChange={(e) => setPreferences({ ...preferences, shareProgress: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-gray-700">Allow sharing progress with fitness apps</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handlePreferencesSave}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Preferences</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Log Out</h4>
                    <p className="text-red-700 text-sm">Sign out of your account</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-red-700 text-sm">Permanently delete your account and all data</p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}