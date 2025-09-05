export function getHub(channelId) {
  const g = globalThis
  if (!g.__educhatHubs) g.__educhatHubs = new Map()
  if (!g.__educhatHubs.has(channelId)) g.__educhatHubs.set(channelId, new Set())
  return g.__educhatHubs.get(channelId)
}

export function publish(channelId, payload) {
  const subs = getHub(channelId)
  const data = `data: ${JSON.stringify(payload)}\n\n`
  for (const controller of subs) {
    try { controller.enqueue(data) } catch {}
  }
}
























