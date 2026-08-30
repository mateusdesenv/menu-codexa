import { Router, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { Friendship } from '../models/friendship.js'
import { User } from '../models/user.js'
import { requireAuth } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../types.js'

const router = Router()

const createFriendSchema = z.object({
  email: z.string().email(),
})

async function enrichFriendship(friendship: any, userId: string) {
  const otherId = friendship.requesterId.toString() === userId ? friendship.recipientId : friendship.requesterId
  const other = await User.findById(otherId).select('_id email name photoUrl').lean()
  return {
    id: friendship._id.toString(),
    otherUser: other
      ? { id: other._id.toString(), email: other.email, name: other.name, photoUrl: other.photoUrl }
      : { id: otherId.toString(), email: '', name: 'Usuário', photoUrl: '' },
    status: friendship.status,
    direction: friendship.requesterId.toString() === userId ? 'sent' : 'received',
    createdAt: friendship.createdAt,
    updatedAt: friendship.updatedAt,
  }
}

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const friendships = await Friendship.find({
      $or: [{ requesterId: req.user!.userId }, { recipientId: req.user!.userId }],
    })
      .sort({ updatedAt: -1 })
      .lean()

    const enriched = await Promise.all(friendships.map((f) => enrichFriendship(f, req.user!.userId)))
    res.json({ friendships: enriched })
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parse = createFriendSchema.safeParse(req.body)
    if (!parse.success) {
      res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() })
      return
    }

    const target = await User.findOne({ email: parse.data.email.toLowerCase() })
    if (!target) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (target._id.toString() === req.user!.userId) {
      res.status(400).json({ message: 'Cannot add yourself' })
      return
    }

    const existing = await Friendship.findOne({
      requesterId: req.user!.userId,
      recipientId: target._id,
    })

    if (existing) {
      res.status(409).json({ message: 'Friend request already sent' })
      return
    }

    const reverse = await Friendship.findOne({
      requesterId: target._id,
      recipientId: req.user!.userId,
    })

    if (reverse) {
      if (reverse.status === 'pending') {
        reverse.status = 'accepted'
        await reverse.save()
        res.json(await enrichFriendship(reverse, req.user!.userId))
        return
      }
      res.status(409).json({ message: 'Already connected' })
      return
    }

    const friendship = await Friendship.create({
      requesterId: req.user!.userId,
      recipientId: target._id,
      status: 'pending',
    })

    res.status(201).json(await enrichFriendship(friendship, req.user!.userId))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/accept', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const friendship = await Friendship.findById((req.params.id as string))
    if (!friendship) {
      res.status(404).json({ message: 'Friend request not found' })
      return
    }

    if (friendship.recipientId.toString() !== req.user!.userId) {
      res.status(403).json({ message: 'Only the recipient can accept' })
      return
    }

    if (friendship.status !== 'pending') {
      res.status(400).json({ message: 'Request is not pending' })
      return
    }

    friendship.status = 'accepted'
    await friendship.save()

    res.json(await enrichFriendship(friendship, req.user!.userId))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const friendship = await Friendship.findById((req.params.id as string))
    if (!friendship) {
      res.status(404).json({ message: 'Friend request not found' })
      return
    }

    if (
      friendship.requesterId.toString() !== req.user!.userId &&
      friendship.recipientId.toString() !== req.user!.userId
    ) {
      res.status(403).json({ message: 'Not authorized' })
      return
    }

    await Friendship.findByIdAndDelete((req.params.id as string))
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
