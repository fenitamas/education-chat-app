"use client"
import { useEffect, useState } from 'react'
import { apiAuth } from '@/utils/api'
import { FaUser, FaEdit, FaCamera, FaSave, FaTimes, FaCheck, FaGraduationCap, FaEnvelope, FaCalendarAlt } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [originalData, setOriginalData] = useState({})

  useEffect(() => {
    ;(async () => {
      try {
        const { user } = await apiAuth('/api/users')
        setUser(user)
        setName(user.name || '')
        setAvatarUrl(user.avatarUrl || '')
        setOriginalData({ name: user.name || '', avatarUrl: user.avatarUrl || '' })
      } catch (err) {
        console.error('Profile load error:', err)
        setError(err.message)
      }
    })()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { user } = await apiAuth('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarUrl })
      })
      setUser(user)
      setOriginalData({ name, avatarUrl })
      toast.success('Profile updated successfully!')
    } catch (e) { 
      toast.error(e.message) 
    } finally { 
      setSaving(false) 
    }
  }

  const cancelEdit = () => {
    setName(originalData.name)
    setAvatarUrl(originalData.avatarUrl)
    setIsEditing(false)
  }

  const hasChanges = name !== originalData.name || avatarUrl !== originalData.avatarUrl

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#FF6A3D] hover:bg-[#E55A2E] text-white font-medium px-6 py-2 rounded-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-blue-500 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Profile</h3>
          <p className="text-gray-600">Please wait while we load your information...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6A3D] to-[#E55A2E] rounded-2xl flex items-center justify-center shadow-lg">
              <FaUser className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Your Profile</h1>
              <p className="text-gray-600 text-lg">Manage your account information and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shadow-lg">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="avatar" className="w-32 h-32 object-cover rounded-2xl" />
                    ) : (
                      <FaUser className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF6A3D] rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-[#E55A2E] transition-all duration-200">
                    <FaCamera className="text-sm" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
                <p className="text-gray-600 capitalize">{user.role?.toLowerCase()}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaEnvelope className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FaGraduationCap className="text-purple-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Role</p>
                    <p className="text-sm text-gray-600 capitalize">{user.role?.toLowerCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaCalendarAlt className="text-green-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
                  <p className="text-gray-600">Update your personal information</p>
                </div>
              </div>

              <form onSubmit={save} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar URL</label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Enter image URL for your avatar"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a valid image URL (e.g., https://example.com/image.jpg)</p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="submit"
                    disabled={saving || !hasChanges}
                    className="inline-flex items-center gap-2 bg-[#FF6A3D] hover:bg-[#E55A2E] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <FaSave className="text-sm" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {hasChanges && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <FaTimes className="text-sm" />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
