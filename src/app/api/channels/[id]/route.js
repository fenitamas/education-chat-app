import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function GET(_req, { params }) {
  try {
    const user = await getUserFromRequest(_req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const base = await prisma.channel.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { 
          include: { 
            user: { select: { id: true, name: true, email: true, role: true } } 
          } 
        }
      }
    })
    
    if (!base) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const isMember = base.members.some((m) => m.userId === user.id)
    const isOwner = base.createdById === user.id
    
    if (!isMember && !isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let pinnedMessage = null
    if (base.pinnedMessageId) {
      try {
        pinnedMessage = await prisma.message.findUnique({
          where: { id: base.pinnedMessageId },
          select: { id: true, text: true, createdAt: true, createdBy: { select: { id: true, name: true } } }
        })
      } catch (e) {
        console.error('Pinned message fetch failed:', e)
      }
    }

    return NextResponse.json({ ...base, pinnedMessage })
  } catch (error) {
    console.error('Channel GET error:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    
    const channel = await prisma.channel.findUnique({
      where: { id }
    })
    
    if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const isOwner = channel.createdById === user.id
    if (!(isOwner || user.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { name, description } = body
    
    const updatedChannel = await prisma.channel.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description })
      }
    })
    
    return NextResponse.json(updatedChannel)
  } catch (error) {
    console.error('Channel PUT error:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
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

    await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({ where: { channelId: id } })
      await tx.resource.deleteMany({ where: { channelId: id } })
      await tx.answer.deleteMany({ where: { question: { channelId: id } } })
      await tx.question.deleteMany({ where: { channelId: id } })
      await tx.channelMember.deleteMany({ where: { channelId: id } })
      await tx.channel.delete({ where: { id } })
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Channel DELETE error:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
