import { Router, type Response, type NextFunction } from 'express'
import { User } from '../models/user.js'
import { requireAuth } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../types.js'

const router = Router()

router.get('/search', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query
    if (!email || typeof email !== 'string') {
      res.status(400).json({ message: 'Email query is required' })
      return
    }

    const regex = new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const users = await User.find({
      _id: { $ne: req.user!.userId },
      email: { $regex: regex },
    })
      .select('_id email name photoUrl')
      .limit(10)
      .lean()

    res.json({
      users: users.map((u: any) => ({ id: u._id.toString(), email: u.email, name: u.name, photoUrl: u.photoUrl })),
    })
  } catch (err) {
    next(err)
  }
})

export default router
