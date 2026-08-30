import { List } from '../models/list.js'

export type ListPermission = 'owner' | 'edit' | 'view' | 'none'

export async function getListPermission(listId: string, userId: string): Promise<ListPermission> {
  const list = await List.findById(listId)
  if (!list) return 'none'

  if (list.ownerId.toString() === userId) return 'owner'

  const member = list.members.find((m) => m.userId.toString() === userId)
  if (member) return member.role

  return 'none'
}
