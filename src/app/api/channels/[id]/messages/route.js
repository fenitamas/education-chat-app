import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'
import { publish } from '@/server/events'

export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const channelId = String(id)

    const channel = await prisma.channel.findUnique({
      where: { id: channelId }
    })
    
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    
    const isMember = await prisma.channelMember.findFirst({
      where: {
        userId: user.id,
        channelId
      }
    })
    
    const isOwner = channel.createdById === user.id
    
    if (!isMember && !isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { channelId },
      select: {
        id: true,
        text: true,
        createdAt: true,
        createdById: true,
        createdBy: { select: { id: true, name: true, role: true } },
        replyTo: { select: { id: true, text: true, createdBy: { select: { id: true, name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(messages.reverse())
  } catch (error) {
    console.error('Messages GET error:', error?.message || error, error?.stack)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const channelId = String(id)

    const channel = await prisma.channel.findUnique({
      where: { id: channelId }
    })
    
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    
    const isMember = await prisma.channelMember.findFirst({
      where: {
        userId: user.id,
        channelId
      }
    })
    
    const isOwner = channel.createdById === user.id
    
    if (!isMember && !isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { text, replyToId } = body || {}

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Message text required' }, { status: 400 })
    }

    console.log('Message POST input:', { channelId, userId: user.id, hasText: !!text, replyToId })

    let replyConnect = undefined
    if (replyToId) {
      const replyId = String(replyToId)
      let parent
      try {
        parent = await prisma.message.findFirst({ where: { id: replyId, channelId } })
      } catch (e) {
        console.error('Reply parent lookup failed:', e)
        return NextResponse.json({ error: `Reply lookup failed: ${e?.message || 'unknown'}` }, { status: 500 })
      }
      if (!parent) {
        return NextResponse.json({ error: 'Invalid reply target for this channel' }, { status: 400 })
      }
      console.log('Reply target found:', { id: parent.id })
      replyConnect = { connect: { id: replyId } }
    }

    try {
      const msg = await prisma.message.create({
        data: {
          text: text.trim(),
          channel: { connect: { id: channelId } },
          createdBy: { connect: { id: user.id } },
          ...(replyConnect ? { replyTo: replyConnect } : {})
        },
        include: {
          createdBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
          replyTo: { select: { id: true, text: true, createdBy: { select: { id: true, name: true } } } }
        }
      })
      console.log('Message created:', { id: msg.id })
      publish(channelId, { type: 'message', payload: msg })
      return NextResponse.json(msg)
    } catch (e) {
      console.error('Message create failed:', e)
      const code = e?.code ? ` [${e.code}]` : ''
      return NextResponse.json({ error: `Create failed${code}: ${e?.message || 'unknown'}` }, { status: 500 })
    }
  } catch (error) {
    console.error('Messages POST error (outer):', error?.message || error, error?.stack)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
