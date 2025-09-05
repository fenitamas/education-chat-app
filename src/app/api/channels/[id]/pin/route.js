import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { messageId } = body // if null, unpin

    const channel = await prisma.channel.findUnique({ where: { id: params.id } })
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    const isOwner = channel.createdById === user.id
    const isTeacherOrAdmin = user.role === 'TEACHER' || user.role === 'ADMIN'
    if (!(isOwner || isTeacherOrAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (messageId) {
      const msg = await prisma.message.findUnique({ where: { id: messageId } })
      if (!msg || msg.channelId !== channel.id) return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const updated = await prisma.channel.update({
      where: { id: params.id },
      data: { pinnedMessageId: messageId || null }
    })

    return NextResponse.json({ pinnedMessageId: updated.pinnedMessageId })
  } catch (error) {
    console.error('Pin POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}






















