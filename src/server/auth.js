import jwt from 'jsonwebtoken'
import { prisma } from './db'

export function signToken(user) {
  const payload = { id: user.id, role: user.role }
  const secret = process.env.JWT_SECRET || 'dev_secret'
  const expiresIn = process.env.JWT_EXPIRE || '7d'
  return jwt.sign(payload, secret, { expiresIn })
}

export async function getUserFromRequest(req) {
  try {
    const auth = req.headers.get('authorization') || ''
    const [, token] = auth.split(' ')
    if (!token) return null
    
    const secret = process.env.JWT_SECRET || 'dev_secret'
    const decoded = jwt.verify(token, secret)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })
    
    return user || null
  } catch {
    return null
  }
}

export function requireRole(allowed) {
  return async function guard(req) {
    const user = await getUserFromRequest(req)
    if (!user) return { ok: false, status: 401, error: 'Unauthorized' }
    if (!allowed.includes(user.role)) return { ok: false, status: 403, error: 'Forbidden' }
    return { ok: true, user }
  }
}
