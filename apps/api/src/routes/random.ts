import { Router, type Response, type NextFunction } from 'express'
import { Dish } from '../models/dish.js'
import { List } from '../models/list.js'
import { requireAuth } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../types.js'

const router = Router()

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { listId, tag, isQuick, yieldsLeftovers } = req.query

    const lists = await List.find({
      $or: [{ ownerId: req.user!.userId }, { 'members.userId': req.user!.userId }],
    })
      .select('_id')
      .lean()

    const allowedListIds = lists.map((l) => l._id.toString())
    if (allowedListIds.length === 0) {
      res.status(404).json({ message: 'No dishes found' })
      return
    }

    const filter: any = { listId: { $in: allowedListIds } }

    if (listId && typeof listId === 'string') {
      filter.listId = listId
    }

    if (tag && typeof tag === 'string') {
      filter.tags = tag
    }

    if (isQuick === 'true') {
      filter.isQuick = true
    }

    if (yieldsLeftovers === 'true') {
      filter.yieldsLeftovers = true
    }

    const dishes = await Dish.find(filter).lean()
    if (dishes.length === 0) {
      res.status(404).json({ message: 'No dishes match the selected filters' })
      return
    }

    const chosen = dishes[Math.floor(Math.random() * dishes.length)]
    res.json({
      dish: {
        id: chosen._id,
        listId: chosen.listId,
        createdBy: chosen.createdBy,
        name: chosen.name,
        description: chosen.description,
        requiredIngredients: chosen.requiredIngredients,
        optionalIngredients: chosen.optionalIngredients,
        tags: chosen.tags,
        prepTimeMinutes: chosen.prepTimeMinutes,
        isQuick: chosen.isQuick,
        yieldsLeftovers: chosen.yieldsLeftovers,
        notes: chosen.notes,
        createdAt: chosen.createdAt,
        updatedAt: chosen.updatedAt,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
