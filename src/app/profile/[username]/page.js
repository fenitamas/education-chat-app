"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { username } = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', avatarUrl: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    // Fetch current user data
    fetch('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        router.push('/auth/login')
        return
      }
      setCurrentUser(data)
    })
    .catch(() => router.push('/auth/login'))

    // Fetch profile user data
    if (!username) return
    ;(async () => {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(username)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load profile')
        setUser(data.user)
        setEditData({ name: data.user.name, avatarUrl: data.user.avatarUrl || '' })
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [username, router])

  const handleSave = async () => {
    if (!editData.name.trim()) {
      toast.error('Name is required')
      return
    }

    setSaving(true)
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Authentication required')
      setSaving(false)
      return
    }
    
    try {
      console.log('Sending profile update:', editData)
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })
      
      console.log('Response status:', response.status)

      const data = await response.json()
      
      if (!response.ok) {
        toast.error(data.error || 'Failed to update profile')
        return
      }
      
      setUser(data)
      setCurrentUser(data)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({ name: user.name, avatarUrl: user.avatarUrl || '' })
    setIsEditing(false)
  }

  const isOwnProfile = currentUser && user && currentUser.id === user.id

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A3D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Profile Not Found</div>
          <p className="text-gray-500">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden border-4 border-white/30">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-blue-100 text-lg">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                      {user.role?.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="p-3 text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Save changes"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <CheckIcon className="h-6 w-6" />
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Edit profile"
                    >
                      <PencilIcon className="h-6 w-6" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar URL (optional)
                  </label>
                  <input
                    type="url"
                    value={editData.avatarUrl}
                    onChange={(e) => setEditData({ ...editData, avatarUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter a URL to an image for your profile picture
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                      <p className="text-gray-900 capitalize">{user.role?.toLowerCase()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                      <p className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}














