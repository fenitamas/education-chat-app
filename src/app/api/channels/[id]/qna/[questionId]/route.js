import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const channel = await prisma.channel.findUnique({
      where: { id: params.id }
    })
    
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    
    const question = await prisma.question.findUnique({
      where: { id: params.questionId },
      include: {
        author: { select: { id: true, name: true, role: true } },
        answers: {
          include: {
            author: { select: { id: true, name: true, role: true } }
          }
        }
      }
    })
    
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    
    return NextResponse.json({ question })
  } catch (error) {
    console.error('Question GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const channel = await prisma.channel.findUnique({
      where: { id: params.id }
    })
    
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    
    const question = await prisma.question.findUnique({
      where: { id: params.questionId }
    })
    
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const { action, text, answerId, solve } = body

    if (action === 'answer') {
      if (!text) return NextResponse.json({ error: 'Answer text required' }, { status: 400 })
      
      const answer = await prisma.answer.create({
        data: {
          text,
          questionId: params.questionId,
          authorId: user.id
        },
        include: {
          author: { select: { id: true, name: true, role: true } }
        }
      })
      
      const updatedQuestion = await prisma.question.findUnique({
        where: { id: params.questionId },
        include: {
          author: { select: { id: true, name: true, role: true } },
          answers: {
            include: {
              author: { select: { id: true, name: true, role: true } }
            }
          }
        }
      })
      
      return NextResponse.json({ question: updatedQuestion })
    }

    if (action === 'solve') {
      // only teacher/admin can mark solved
      if (!(user.role === 'teacher' || user.role === 'admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      const updatedQuestion = await prisma.question.update({
        where: { id: params.questionId },
        data: { isSolved: !!solve },
        include: {
          author: { select: { id: true, name: true, role: true } },
          answers: {
            include: {
              author: { select: { id: true, name: true, role: true } }
            }
          }
        }
      })
      
      return NextResponse.json({ question: updatedQuestion })
    }

    if (action === 'upvote') {
      if (!answerId) return NextResponse.json({ error: 'answerId required' }, { status: 400 })
      
      const answer = await prisma.answer.findUnique({
        where: { id: answerId }
      })
      
      if (!answer) return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
      
      // For now, we'll just increment upvotes
      // In a real app, you might want to track individual upvotes per user
      const updatedAnswer = await prisma.answer.update({
        where: { id: answerId },
        data: { upvotes: { increment: 1 } }
      })
      
      const updatedQuestion = await prisma.question.findUnique({
        where: { id: params.questionId },
        include: {
          author: { select: { id: true, name: true, role: true } },
          answers: {
            include: {
              author: { select: { id: true, name: true, role: true } }
            }
          }
        }
      })
      
      return NextResponse.json({ question: updatedQuestion })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('Question POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
