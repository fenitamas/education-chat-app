import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: channelId, messageId } = await params

    const message = await prisma.message.findUnique({ where: { id: messageId } })
    if (!message || message.channelId !== channelId) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const channel = await prisma.channel.findUnique({ where: { id: channelId } })
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    const isSender = message.createdById === user.id
    const isOwner = channel.createdById === user.id
    const isTeacherOrAdmin = user.role === 'TEACHER' || user.role === 'ADMIN'

    if (!(isSender || isOwner || isTeacherOrAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.message.delete({ where: { id: messageId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Message DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: channelId, messageId } = await params
    const body = await req.json().catch(() => ({}))
    const { text } = body
    if (!text || !text.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 })

    const message = await prisma.message.findUnique({ where: { id: messageId } })
    if (!message || message.channelId !== channelId) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const channel = await prisma.channel.findUnique({ where: { id: channelId } })
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    const isSender = message.createdById === user.id
    const isOwner = channel.createdById === user.id
    const isTeacherOrAdmin = user.role === 'TEACHER' || user.role === 'ADMIN'

    if (!(isSender || isOwner || isTeacherOrAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { text },
      include: { createdBy: { select: { id: true, name: true, role: true, avatarUrl: true } } }
    })

    return NextResponse.json({ message: updated })
  } catch (error) {
    console.error('Message PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
