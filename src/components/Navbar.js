'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaGraduationCap, FaBars, FaTimes, FaUser, FaHome, FaTachometerAlt, FaUserCircle } from 'react-icons/fa'
import { clearAuth, getAuth } from '@/utils/api'
import { toast } from 'react-hot-toast'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isAuthPage = pathname.startsWith('/auth/')

  useEffect(() => {
    const { token, user } = getAuth()
    if (token && user) {
      setIsLoggedIn(true)
      setUser(user)
    } else {
      setIsLoggedIn(false)
      setUser(null)
    }
  }, [pathname])

  const handleLogout = () => {
    clearAuth()
    setIsLoggedIn(false)
    setUser(null)
    toast.success('Signed out')
    window.location.href = '/'
  }

  const linkCls = (href) => `flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
    pathname === href 
      ? 'text-[#FF6A3D] bg-[#FF6A3D]/10 border border-[#FF6A3D]/20' 
      : 'text-gray-700 hover:text-[#FF6A3D] hover:bg-gray-50'
  }`

  const RegisterBtn = ({ className = '' }) => (
    <Link
      href="/auth/register"
      className={`inline-flex items-center justify-center rounded-xl bg-[#FF6A3D] text-white font-semibold px-6 py-2.5 shadow-sm hover:bg-[#E55A2E] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:ring-offset-2 ${className}`}
    >
      Register
    </Link>
  )
  
  const LoginBtn = ({ className = '' }) => (
    <Link
      href="/auth/login"
      className={`inline-flex items-center justify-center rounded-xl border-2 border-gray-200 text-[#1E2A47] font-semibold px-6 py-2.5 hover:border-[#FF6A3D] hover:text-[#FF6A3D] hover:bg-[#FF6A3D]/5 transform hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:ring-offset-2 ${className}`}
    >
      Login
    </Link>
  )

  const HomeBtn = ({ className = '' }) => (
    <Link
      href="/"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 text-[#1E2A47] font-semibold px-6 py-2.5 hover:border-[#FF6A3D] hover:text-[#FF6A3D] hover:bg-[#FF6A3D]/5 transform hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:ring-offset-2 ${className}`}
    >
      <FaHome className="text-sm" />
      Home
    </Link>
  )

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo (left) */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6A3D] to-[#E55A2E] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                <FaGraduationCap className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-200" />
              </div>
              <span className="text-2xl font-bold text-[#1E2A47] group-hover:text-[#FF6A3D] transition-colors duration-200">EduChat</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {isHome ? (
              <div className="flex items-center gap-3">
                <LoginBtn />
                <RegisterBtn />
              </div>
            ) : isAuthPage ? (
              <div className="flex items-center gap-3">
                <HomeBtn />
                {pathname === '/auth/login' ? <RegisterBtn /> : <LoginBtn />}
              </div>
            ) : (
              <>
                <Link href="/" className={linkCls('/')}>
                  <FaHome className="text-sm" />
                  Home
                </Link>
                <Link href="/dashboard" className={linkCls('/dashboard')}>
                  <FaTachometerAlt className="text-sm" />
                  Dashboard
                </Link>
                <Link href="/profile" className={linkCls('/profile')}>
                  <FaUserCircle className="text-sm" />
                  Profile
                </Link>
                {isLoggedIn ? (
                  <div className="flex items-center gap-3 pl-4 ml-4 border-l border-gray-200">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                        {user?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatarUrl} alt="avatar" className="h-10 w-10 object-cover rounded-xl" />
                        ) : (
                          <FaUser className="h-4 w-4 text-[#1E2A47]" />
                        )}
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                      </div>
                    </div>
                                         <button 
                       onClick={handleLogout} 
                       className="inline-flex items-center justify-center rounded-xl border border-gray-200 text-[#1E2A47] font-medium px-4 py-2.5 hover:border-[#FF6A3D] hover:text-[#FF6A3D] hover:bg-[#FF6A3D]/5 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:ring-offset-2"
                     >
                       Sign Out
                     </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <LoginBtn />
                    <RegisterBtn />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-[#1E2A47] hover:text-[#FF6A3D] hover:border-[#FF6A3D] hover:bg-[#FF6A3D]/5 transition-all duration-200"
            >
              {isOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-4 pb-6 space-y-3 bg-white border-t border-gray-100 rounded-b-2xl shadow-lg">
              {isHome ? (
                <>
                  <LoginBtn className="w-full" />
                  <RegisterBtn className="w-full" />
                </>
              ) : isAuthPage ? (
                <>
                  <HomeBtn className="w-full" />
                  {pathname === '/auth/login' ? <RegisterBtn className="w-full" /> : <LoginBtn className="w-full" />}
                </>
              ) : (
                <>
                                     <Link href="/" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-[#1E2A47] hover:bg-[#1E2A47]/5 transition-all duration-200">
                     <FaHome className="text-sm" />
                     Home
                   </Link>
                   <Link href="/dashboard" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-[#1E2A47] hover:bg-[#1E2A47]/5 transition-all duration-200">
                     <FaTachometerAlt className="text-sm" />
                     Dashboard
                   </Link>
                   <Link href="/profile" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-[#1E2A47] hover:bg-[#1E2A47]/5 transition-all duration-200">
                     <FaUserCircle className="text-sm" />
                     Profile
                   </Link>
                  {isLoggedIn ? (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 px-4 py-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          {user?.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatarUrl} alt="avatar" className="h-10 w-10 object-cover rounded-xl" />
                          ) : (
                            <FaUser className="h-4 w-4 text-[#1E2A47]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                      </div>
                                             <button 
                         onClick={handleLogout} 
                         className="w-full text-left px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-[#1E2A47] hover:bg-[#1E2A47]/5 transition-all duration-200"
                       >
                         Sign Out
                       </button>
                    </div>
                  ) : (
                    <>
                      <LoginBtn className="w-full" />
                      <RegisterBtn className="w-full" />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
