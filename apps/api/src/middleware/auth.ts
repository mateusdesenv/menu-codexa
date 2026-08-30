import type { Response, NextFunction } from 'express'
import { verifyJwt } from '../utils/token.js'
import type { AuthenticatedRequest } from '../types.js'

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : header

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const payload = verifyJwt(token)
  if (!payload) {
    res.status(401).json({ message: 'Invalid token' })
    return
  }

  req.user = payload
  next()
}
