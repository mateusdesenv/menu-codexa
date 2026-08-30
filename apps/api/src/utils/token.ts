import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import type { AuthUser } from '../types.js'

export function createJwt(userId: string, email: string): string {
  return jwt.sign({ userId, email } as AuthUser, config.jwtSecret, { expiresIn: '7d' })
}

export function verifyJwt(token: string): AuthUser | null {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthUser
  } catch {
    return null
  }
}
