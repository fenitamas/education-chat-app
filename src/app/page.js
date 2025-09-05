'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { FaGraduationCap, FaUsers, FaComments, FaBookOpen, FaRocket, FaShieldAlt, FaLink, FaQuestionCircle, FaHashtag } from 'react-icons/fa'

export default function HomePage() {
  const features = useMemo(() => ([
    { icon: <FaComments className="w-8 h-8" />, title: 'Real-time Chat', description: 'Instant discussions with typing indicators, replies, pins, and file sharing' },
    { icon: <FaUsers className="w-8 h-8" />, title: 'Class Channels', description: 'Organized spaces for courses with members, resources, and Q&A' },
    { icon: <FaBookOpen className="w-8 h-8" />, title: 'Resources', description: 'Share PDFs, images, videos, and links right inside the channel' },
    { icon: <FaGraduationCap className="w-8 h-8" />, title: 'Q&A', description: 'Ask questions and get verified answers from teachers and peers' },
    { icon: <FaRocket className="w-8 h-8" />, title: 'Modern UX', description: 'Clean, keyboard-friendly interface with fast, optimistic updates' },
    { icon: <FaShieldAlt className="w-8 h-8" />, title: 'Secure', description: 'JWT auth, role-based access, and safe moderation controls' }
  ]), [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1E2A47]" />
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
              Learn together. Faster.
            </h1>
            <p className="text-lg md:text-2xl leading-relaxed text-white/85 mb-10">
              EduChat brings students and teachers into focused channels with real-time chat, resource sharing, and structured Q&A — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="inline-flex items-center justify-center rounded-lg bg-[#FF6A3D] text-white font-semibold px-8 py-3 shadow-sm hover:bg-[#ff5a26] transition">
                Create free account
              </Link>
              <Link href="/auth/login" className="inline-flex items-center justify-center rounded-lg bg-white text-[#1E2A47] font-semibold px-8 py-3 shadow-sm hover:bg-white/95 border border-white/70 transition">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Everything your class needs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Purpose-built features that make collaboration clear, quick, and delightful.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden bg-white group">
                <div className="h-1 bg-[#FF6A3D] group-hover:opacity-90" />
                <div className="p-6 transform transition duration-200 group-hover:-translate-y-0.5">
                  <div className="text-[#1E2A47] mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1E2A47]" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Bring your class together</h2>
          <p className="text-lg text-white/90 mb-8">Create channels for every course, keep resources organized, and move from question to answer in seconds.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="inline-flex items-center justify-center rounded-lg bg-[#FF6A3D] text-white font-semibold px-8 py-3 shadow-sm hover:bg-[#ff5a26] transition">
              Get started free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
