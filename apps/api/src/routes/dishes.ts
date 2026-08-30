import { Router, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { Dish } from '../models/dish.js'
import { List } from '../models/list.js'
import { requireAuth } from '../middleware/auth.js'
import { getListPermission } from '../utils/permissions.js'
import type { AuthenticatedRequest } from '../types.js'

const router = Router()

const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
})

const createDishSchema = z.object({
  listId: z.string(),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  requiredIngredients: z.array(ingredientSchema).default([]),
  optionalIngredients: z.array(ingredientSchema).default([]),
  tags: z.array(z.string()).default([]),
  prepTimeMinutes: z.number().min(0).optional(),
  isQuick: z.boolean().default(false),
  yieldsLeftovers: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
})

const updateDishSchema = createDishSchema.partial().omit({ listId: true })

async function accessibleListIds(userId: string, listId?: string) {
  const query: any = {
    $or: [{ ownerId: userId }, { 'members.userId': userId }],
  }
  if (listId) {
    query._id = listId
  }
  const lists = await List.find(query).select('_id').lean()
  return lists.map((l) => l._id.toString())
}

function dishToJson(dish: any) {
  return {
    id: dish._id,
    listId: dish.listId,
    createdBy: dish.createdBy,
    name: dish.name,
    description: dish.description,
    requiredIngredients: dish.requiredIngredients,
    optionalIngredients: dish.optionalIngredients,
    tags: dish.tags,
    prepTimeMinutes: dish.prepTimeMinutes,
    isQuick: dish.isQuick,
    yieldsLeftovers: dish.yieldsLeftovers,
    notes: dish.notes,
    createdAt: dish.createdAt,
    updatedAt: dish.updatedAt,
  }
}

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, listId, tag, isQuick, yieldsLeftovers } = req.query

    const allowedListIds = await accessibleListIds(req.user!.userId, listId as string | undefined)
    if (allowedListIds.length === 0) {
      res.json({ dishes: [] })
      return
    }

    const filter: any = { listId: { $in: allowedListIds } }

    if (search && typeof search === 'string') {
      filter.$text = { $search: search }
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

    const dishes = await Dish.find(filter).sort({ name: 1 }).lean()
    res.json({ dishes: dishes.map(dishToJson) })
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parse = createDishSchema.safeParse(req.body)
    if (!parse.success) {
      res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() })
      return
    }

    const permission = await getListPermission(parse.data.listId, req.user!.userId)
    if (!['owner', 'edit'].includes(permission)) {
      res.status(403).json({ message: 'No permission to add dishes to this list' })
      return
    }

    const dish = await Dish.create({
      ...parse.data,
      createdBy: req.user!.userId,
    })

    res.status(201).json(dishToJson(dish))
  } catch (err) {
    next(err)
  }
})

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dish = await Dish.findById((req.params.id as string)).lean()
    if (!dish) {
      res.status(404).json({ message: 'Dish not found' })
      return
    }

    const permission = await getListPermission(dish.listId.toString(), req.user!.userId)
    if (permission === 'none') {
      res.status(404).json({ message: 'Dish not found' })
      return
    }

    res.json(dishToJson(dish))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dish = await Dish.findById((req.params.id as string))
    if (!dish) {
      res.status(404).json({ message: 'Dish not found' })
      return
    }

    const permission = await getListPermission(dish.listId.toString(), req.user!.userId)
    if (!['owner', 'edit'].includes(permission)) {
      res.status(403).json({ message: 'No permission to edit this dish' })
      return
    }

    const parse = updateDishSchema.safeParse(req.body)
    if (!parse.success) {
      res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() })
      return
    }

    Object.assign(dish, parse.data)
    await dish.save()

    res.json(dishToJson(dish))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dish = await Dish.findById((req.params.id as string))
    if (!dish) {
      res.status(404).json({ message: 'Dish not found' })
      return
    }

    const permission = await getListPermission(dish.listId.toString(), req.user!.userId)
    if (!['owner', 'edit'].includes(permission)) {
      res.status(403).json({ message: 'No permission to delete this dish' })
      return
    }

    await Dish.findByIdAndDelete((req.params.id as string))
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
