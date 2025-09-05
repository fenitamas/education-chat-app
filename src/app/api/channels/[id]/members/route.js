import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const channel = await prisma.channel.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } }
          }
        }
      }
    })
    
    if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const isMember = channel.members.some((m) => m.userId === user.id)
    const isOwner = channel.createdById === user.id
    
    if (!isMember && !isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json({ members: channel.members })
  } catch (error) {
    console.error('Members GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const channel = await prisma.channel.findUnique({
      where: { id }
    })
    
    if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const isOwner = channel.createdById === user.id
    if (!(isOwner || user.role === 'ADMIN' || user.role === 'TEACHER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { userId, email, remove } = body
    
    if (!userId && !email) return NextResponse.json({ error: 'userId or email required' }, { status: 400 })
    
    let target
    if (userId) {
      target = await prisma.user.findUnique({ where: { id: userId } })
    } else if (email) {
      target = await prisma.user.findUnique({ where: { email } })
    }
    
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
    const targetUserId = target.id

    if (remove) {
      await prisma.channelMember.deleteMany({ where: { userId: targetUserId, channelId: id } })
    } else {
      const existingMember = await prisma.channelMember.findFirst({ where: { userId: targetUserId, channelId: id } })
      if (!existingMember) {
        await prisma.channelMember.create({ data: { userId: targetUserId, channelId: id } })
      }
    }

    const updated = await prisma.channel.findUnique({
      where: { id },
      include: { members: { include: { user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } } } } }
    })
    
    return NextResponse.json({ members: updated.members })
  } catch (error) {
    console.error('Members POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    await prisma.channelMember.deleteMany({ where: { userId: user.id, channelId: id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Members DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
