import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export async function GET(_req, { params }) {
  try {
    const { username } = await params
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 })

    const user = await prisma.user.findFirst({
      where: { name: username },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true }
    })

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User by username GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}






















