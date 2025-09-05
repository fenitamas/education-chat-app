"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiAuth, getAuth } from '@/utils/api'
import EmptyState from '@/components/EmptyState'
import { SkeletonCard } from '@/components/Skeleton'
import { FaGraduationCap, FaUsers, FaComments, FaBook, FaCalendarAlt, FaBell } from 'react-icons/fa'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const { user } = getAuth()
    if (!user) {
      window.location.href = '/auth/login'
      return
    }
    setUser(user)
    
    // Load channels with caching
    const loadChannels = async () => {
      try {
        const { channels } = await apiAuth('/api/channels', { method: 'GET' })
        setChannels(channels)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadChannels()
  }, [])

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBell className="text-red-500 text-2xl" />
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

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN'
  const totalChannels = channels.length
  const activeChannels = channels.filter(ch => ch.memberCount > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6A3D] to-[#E55A2E] rounded-2xl flex items-center justify-center shadow-lg">
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {isTeacher ? 'Manage your educational channels' : 'Continue your learning journey'}
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Channels</p>
                  <p className="text-3xl font-bold text-gray-900">{totalChannels}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Channels</p>
                  <p className="text-3xl font-bold text-gray-900">{activeChannels}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaComments className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Role</p>
                  <p className="text-3xl font-bold text-gray-900 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FaBook className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Channel Section for Teachers */}
        {isTeacher && (
          <div className="mb-8 animate-slide-up">
            <CreateChannel onCreated={(ch) => setChannels([ch, ...channels])} />
          </div>
        )}

        {/* Channels Section */}
        <section className="animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Channels</h2>
              <p className="text-gray-600">
                {isTeacher ? 'Manage your educational spaces' : 'Join the conversation in your channels'}
              </p>
            </div>
            {!isTeacher && channels.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaCalendarAlt className="text-gray-400" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
            </div>
          ) : channels.length === 0 ? (
            <EmptyState
              title={isTeacher ? "No channels yet" : "No channels assigned"}
              description={isTeacher ? 'Create your first channel to get started.' : 'You are not enrolled in any channels yet. Contact your teacher to get access.'}
              action={isTeacher && <CreateChannel inline onCreated={(ch) => setChannels([ch, ...channels])} />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((ch) => (
                <Link 
                  key={ch.id} 
                  href={`/chat/${ch.id}`} 
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#FF6A3D]/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF6A3D] to-[#E55A2E] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <FaComments className="text-white text-lg" />
                    </div>
                    {ch.memberCount > 0 && (
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                        {ch.memberCount} members
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#FF6A3D] transition-colors duration-200">
                    {ch.name}
                  </h3>
                  
                  {ch.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {ch.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created by {ch.createdBy?.name || 'Unknown'}</span>
                    <span className="group-hover:text-[#FF6A3D] transition-colors duration-200">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function CreateChannel({ onCreated, inline = false }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const create = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { channel } = await apiAuth('/api/channels', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
        headers: { 'Content-Type': 'application/json' },
      })
      onCreated(channel)
      setName('')
      setDescription('')
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${inline ? 'p-6' : 'p-8'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#FF6A3D] to-[#E55A2E] rounded-xl flex items-center justify-center">
          <FaGraduationCap className="text-white text-lg" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Create New Channel</h3>
          <p className="text-gray-600 text-sm">Set up a new learning space for your students</p>
        </div>
      </div>
      
      <form onSubmit={create} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Channel Name</label>
          <input 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500" 
            placeholder="Enter channel name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
          <textarea 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none" 
            placeholder="What's this channel about?"
            rows={3}
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <button 
          className="w-full bg-[#FF6A3D] hover:bg-[#E55A2E] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-lg"
          disabled={loading}
        >
          {loading ? 'Creating Channel...' : 'Create Channel'}
        </button>
      </form>
    </div>
  )

  return content
}
