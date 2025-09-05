import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: channelId, resourceId } = await params

    const channel = await prisma.channel.findUnique({ where: { id: channelId } })
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    const isMember = await prisma.channelMember.findFirst({ where: { userId: user.id, channelId } })
    const isOwner = channel.createdById === user.id

    if (!isMember && !isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only teachers and admins can delete resources
    if (user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Students cannot delete resources' }, { status: 403 })
    }

    const resource = await prisma.resource.findUnique({ 
      where: { id: resourceId },
      include: { channel: true }
    })

    if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 })

    // Check if resource belongs to this channel
    if (resource.channelId !== channelId) {
      return NextResponse.json({ error: 'Resource not found in this channel' }, { status: 404 })
    }

    await prisma.resource.delete({ where: { id: resourceId } })

    return NextResponse.json({ message: 'Resource deleted successfully' })
  } catch (error) {
    console.error('Resource DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}








