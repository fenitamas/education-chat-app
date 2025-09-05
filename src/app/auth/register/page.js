"use client"
import { useState } from 'react'
import Link from 'next/link'
import { apiPost, saveAuth } from '@/utils/api'
import { toast } from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { token, user } = await apiPost('/api/auth', { action: 'signup', name, email, password, role })
      saveAuth(token, user)
      toast.success(`Welcome, ${user.name}`)
      window.location.href = '/dashboard'
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-[#F7FAFC] rounded-xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Create your account</h1>
        <p className="text-gray-600 mb-6">Join EduChat and start learning</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A47] focus:border-transparent transition-all duration-200" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A47] focus:border-transparent transition-all duration-200" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A47] focus:border-transparent transition-all duration-200" 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A47] focus:border-transparent transition-all duration-200" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Teacher role requires a verified educational email (e.g., @school.edu)</p>
          </div>
          <button 
            disabled={loading} 
            className="w-full bg-[#FF6A3D] hover:bg-[#E55A2E] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          Already have an account? <Link className="text-[#1E2A47] hover:text-[#0F1A33] hover:underline transition-colors duration-200" href="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}





