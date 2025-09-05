import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function GET(req) {
  try {
    const me = await getUserFromRequest(req)
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { searchParams } = new URL(req.url)
    const email = (searchParams.get('email') || '').toLowerCase().trim()
    
    if (!email) return NextResponse.json({ error: 'email query required' }, { status: 400 })
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
    const safe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    }
    
    return NextResponse.json({ user: safe })
  } catch (error) {
    console.error('User find error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
