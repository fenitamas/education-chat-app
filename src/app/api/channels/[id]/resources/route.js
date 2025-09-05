import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const channel = await prisma.channel.findUnique({ where: { id } })
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    const isMember = await prisma.channelMember.findFirst({ where: { userId: user.id, channelId: id } })
    const isOwner = channel.createdById === user.id

    if (!isMember && !isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resources = await prisma.resource.findMany({
      where: { channelId: id },
      include: { uploadedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ resources })
  } catch (error) {
    console.error('Resources GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const channel = await prisma.channel.findUnique({ where: { id } })
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    const isMember = await prisma.channelMember.findFirst({ where: { userId: user.id, channelId: id } })
    const isOwner = channel.createdById === user.id

    if (!isMember && !isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Students cannot post resources' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { title, description, url } = body

    if (!title || !url) return NextResponse.json({ error: 'title and url are required' }, { status: 400 })

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || null,
        type: 'LINK', // Default type since we removed the type field
        url,
        channelId: id,
        uploadedById: user.id
      },
      include: { uploadedBy: { select: { id: true, name: true, email: true } } }
    })

    return NextResponse.json({ resource }, { status: 201 })
  } catch (error) {
    console.error('Resources POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
