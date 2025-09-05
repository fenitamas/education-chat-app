import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let channels = []
    
    if (user.role === 'TEACHER' || user.role === 'ADMIN') {
      // Get channels created by user or where user is a member
      channels = await prisma.channel.findMany({
        where: {
          OR: [
            { createdById: user.id },
            { members: { some: { userId: user.id } } }
          ]
        },
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { members: true } }
        },
        orderBy: { updatedAt: 'desc' }
      })
    } else {
      // Students only see channels they're members of
      channels = await prisma.channel.findMany({
        where: {
          members: { some: { userId: user.id } }
        },
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { members: true } }
        },
        orderBy: { updatedAt: 'desc' }
      })
    }

    // Add memberCount to each channel
    channels = channels.map(channel => ({
      ...channel,
      memberCount: channel._count.members
    }))

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Channels GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!(user.role === 'TEACHER' || user.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { name, description } = body
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    // Create channel and add creator as member in a transaction
    const channel = await prisma.$transaction(async (tx) => {
      const newChannel = await tx.channel.create({
        data: {
          name,
          description,
          createdById: user.id
        }
      })

      // Add creator as member
      await tx.channelMember.create({
        data: {
          userId: user.id,
          channelId: newChannel.id
        }
      })

      return newChannel
    })

    return NextResponse.json({ channel }, { status: 201 })
  } catch (error) {
    console.error('Channels POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
