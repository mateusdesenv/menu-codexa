import { Router, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { List } from '../models/list.js'
import { User } from '../models/user.js'
import { requireAuth } from '../middleware/auth.js'
import { getListPermission } from '../utils/permissions.js'
import type { AuthenticatedRequest } from '../types.js'

const router = Router()

const createListSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
})

const updateListSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
})

function listToJson(list: any, userId: string) {
  const permission = list.ownerId.toString() === userId ? 'owner' : list.members.find((m: any) => m.userId.toString() === userId)?.role || 'none'
  return {
    id: list._id,
    ownerId: list.ownerId,
    name: list.name,
    description: list.description,
    members: list.members,
    permission,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }
}

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const lists = await List.find({
      $or: [{ ownerId: req.user!.userId }, { 'members.userId': req.user!.userId }],
    })
      .sort({ updatedAt: -1 })
      .lean()

    res.json({ lists: lists.map((list) => listToJson(list, req.user!.userId)) })
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parse = createListSchema.safeParse(req.body)
    if (!parse.success) {
      res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() })
      return
    }

    const list = await List.create({
      ownerId: req.user!.userId,
      name: parse.data.name,
      description: parse.data.description || '',
    })

    res.status(201).json(listToJson(list, req.user!.userId))
  } catch (err) {
    next(err)
  }
})

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const permission = await getListPermission((req.params.id as string), req.user!.userId)
    if (permission === 'none') {
      res.status(404).json({ message: 'List not found' })
      return
    }

    const list = await List.findById((req.params.id as string)).lean()
    if (!list) {
      res.status(404).json({ message: 'List not found' })
      return
    }

    res.json(listToJson(list, req.user!.userId))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const permission = await getListPermission((req.params.id as string), req.user!.userId)
    if (permission !== 'owner') {
      res.status(403).json({ message: 'Only the owner can edit the list' })
      return
    }

    const parse = updateListSchema.safeParse(req.body)
    if (!parse.success) {
      res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() })
      return
    }

    const list = await List.findByIdAndUpdate((req.params.id as string), parse.data, { new: true }).lean()
    if (!list) {
      res.status(404).json({ message: 'List not found' })
      return
    }

    res.json(listToJson(list, req.user!.userId))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const permission = await getListPermission((req.params.id as string), req.user!.userId)
    if (permission !== 'owner') {
      res.status(403).json({ message: 'Only the owner can delete the list' })
      return
    }

    await List.findByIdAndDelete((req.params.id as string))
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

const shareSchema = z.object({
  email: z.string().email(),
  role: z.enum(['view', 'edit']),
})

const updateShareSchema = z.object({
  role: z.enum(['view', 'edit']),
})

router.post('/:id/shares', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const permission = await getListPermission((req.params.id as string), req.user!.userId)
    if (permission !== 'owner') {
      res.status(403).json({ message: 'Only the owner can share the list' })
      return
    }

    const parse = shareSchema.safeParse(req.body)
    if (!parse.success) {
      res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() })
      return
    }

    const list = await List.findById((req.params.id as string))
    if (!list) {
      res.status(404).json({ message: 'List not found' })
      return
    }

    const target = await User.findOne({ email: parse.data.email.toLowerCase() })
    if (!target) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (target._id.toString() === list.ownerId.toString()) {
      res.status(400).json({ message: 'Owner cannot be a member' })
      return
    }

    const existing = list.members.find((m) => m.userId.toString() === target._id.toString())
    if (existing) {
      existing.role = parse.data.role
    } else {
      list.members.push({ userId: target._id, role: parse.data.role, addedAt: new Date() })
    }

    await list.save()
    res.json(listToJson(list, req.user!.userId))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/shares/:userId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const permission = await getListPermission((req.params.id as string), req.user!.userId)
    if (permission !== 'owner') {
      res.status(403).json({ message: 'Only the owner can update shares' })
      return
    }

    const parse = updateShareSchema.safeParse(req.body)
    if (!parse.success) {
      res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() })
      return
    }

    const list = await List.findById((req.params.id as string))
    if (!list) {
      res.status(404).json({ message: 'List not found' })
      return
    }

    const member = list.members.find((m) => m.userId.toString() === (req.params.userId as string))
    if (!member) {
      res.status(404).json({ message: 'Member not found' })
      return
    }

    member.role = parse.data.role
    await list.save()
    res.json(listToJson(list, req.user!.userId))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id/shares/:userId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const permission = await getListPermission((req.params.id as string), req.user!.userId)
    if (permission !== 'owner') {
      res.status(403).json({ message: 'Only the owner can remove shares' })
      return
    }

    const list = await List.findById((req.params.id as string))
    if (!list) {
      res.status(404).json({ message: 'List not found' })
      return
    }

    list.members = list.members.filter((m) => m.userId.toString() !== (req.params.userId as string))
    await list.save()
    res.json(listToJson(list, req.user!.userId))
  } catch (err) {
    next(err)
  }
})

export default router
