import { getHub } from '@/server/events'

export async function GET(_req, { params }) {
  const { id: channelId } = await params
  const stream = new ReadableStream({
    start(controller) {
      const subs = getHub(channelId)
      subs.add(controller)
      const hello = `data: ${JSON.stringify({ type: 'hello', ts: Date.now() })}\n\n`
      controller.enqueue(hello)
      const heartbeat = setInterval(() => {
        try { controller.enqueue(`: keep-alive ${Date.now()}\n\n`) } catch {}
      }, 15000)
      controller._cleanup = () => {
        clearInterval(heartbeat)
        subs.delete(controller)
      }
    },
    cancel() { /* noop */ }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  })
}

export async function DELETE(_req, { params }) {
  await params
  return new Response(null, { status: 204 })
}


