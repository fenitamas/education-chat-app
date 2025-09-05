import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/server/auth'
import { publish } from '@/server/events'

export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const body = await req.json().catch(() => ({}))
    const { isTyping = true } = body

    publish(id, {
      type: 'typing',
      payload: {
        userId: user.id,
        name: user.name,
        isTyping,
        ts: Date.now()
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Typing POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
