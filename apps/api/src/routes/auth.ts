import { Router } from 'express'
import { verifyFirebaseIdToken } from '../utils/firebase.js'
import { createJwt } from '../utils/token.js'
import { User } from '../models/user.js'
import type { AuthenticatedRequest } from '../types.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = req.body
    if (!idToken || typeof idToken !== 'string') {
      res.status(400).json({ message: 'idToken is required' })
      return
    }

    const firebaseUser = await verifyFirebaseIdToken(idToken)
    if (!firebaseUser) {
      res.status(401).json({ message: 'Invalid Firebase token' })
      return
    }

    const email = (firebaseUser.email || '').toLowerCase()
    if (!email) {
      res.status(400).json({ message: 'Firebase user has no email' })
      return
    }

    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({
        firebaseId: firebaseUser.localId,
        email,
        name: firebaseUser.displayName || email.split('@')[0],
        photoUrl: firebaseUser.photoUrl || '',
      })
    } else {
      user.firebaseId = firebaseUser.localId
      user.name = firebaseUser.displayName || user.name
      user.photoUrl = firebaseUser.photoUrl || user.photoUrl
      await user.save()
    }

    const token = createJwt(user._id.toString(), user.email)

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.userId)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      photoUrl: user.photoUrl,
    })
  } catch (err) {
    next(err)
  }
})

export default router
