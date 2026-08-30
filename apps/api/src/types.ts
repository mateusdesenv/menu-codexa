import type { Request } from 'express'

export interface AuthUser {
  userId: string
  email: string
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser
}

export interface FirebaseUserInfo {
  localId: string
  email?: string
  displayName?: string
  photoUrl?: string
}
