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

    const isMember = await prisma.channelMember.findFirst({
      where: { userId: user.id, channelId: id }
    })

    const isOwner = channel.createdById === user.id

    if (!isMember && !isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const questions = await prisma.question.findMany({
      where: { channelId: id },
      include: {
        author: { select: { id: true, name: true, role: true } },
        answers: { include: { author: { select: { id: true, name: true, role: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match frontend expectations
    const transformedQuestions = questions.map(question => ({
      ...question,
      createdBy: question.author,
      answers: question.answers?.map(answer => ({
        ...answer,
        createdBy: answer.author
      })) || []
    }))

    return NextResponse.json({ questions: transformedQuestions })
  } catch (error) {
    console.error('Q&A GET error:', error)
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

    const isMember = await prisma.channelMember.findFirst({
      where: { userId: user.id, channelId: id }
    })

    const isOwner = channel.createdById === user.id

    if (!isMember && !isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { title, description } = body
    if (!title || !description) return NextResponse.json({ error: 'Title and description required' }, { status: 400 })

    const question = await prisma.question.create({
      data: { 
        title, 
        description, 
        channelId: id, 
        authorId: user.id 
      },
      include: { author: { select: { id: true, name: true, role: true } } }
    })

    // Transform the data to match frontend expectations
    const transformedQuestion = {
      ...question,
      createdBy: question.author,
      answers: []
    }

    return NextResponse.json(transformedQuestion, { status: 201 })
  } catch (error) {
    console.error('Q&A POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
