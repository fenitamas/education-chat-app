import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/server/db'

export async function POST(req) {
  try {
    console.log('Auth API called')
    const body = await req.json().catch(() => ({}))
    console.log('Request body:', body)
    const { action, name, email, password, role } = body

    if (action === 'signup') {
      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
      }

      // Role validation: only allow teacher via verified domain (example)
      if (role === 'teacher' && !(email.endsWith('@school.edu') || email.endsWith('@edu.org'))) {
        return NextResponse.json({ error: 'Teacher signup requires verified email' }, { status: 403 })
      }

      // Check if user already exists
      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: role?.toUpperCase() || 'STUDENT'
        }
      })

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      const safe = { id: user.id, name: user.name, email: user.email, role: user.role }
      return NextResponse.json({ user: safe, token }, { status: 201 })
    }

    if (action === 'login') {
      console.log('Login attempt for:', email)
      if (!email || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
      
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        console.log('User not found for email:', email)
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      
      console.log('User found:', user.id, user.email, user.role)
      
      const ok = await bcrypt.compare(password, user.passwordHash)
      if (!ok) {
        console.log('Password mismatch for user:', user.email)
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      
      console.log('Login successful for user:', user.email)
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
      
      console.log('JWT token created for user:', user.id)
      
      const safe = { id: user.id, name: user.name, email: user.email, role: user.role }
      return NextResponse.json({ user: safe, token }, { status: 200 })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
