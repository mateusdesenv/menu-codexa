export interface User {
  id: string
  email: string
  name: string
  photoUrl?: string
}

export interface List {
  id: string
  ownerId: string
  name: string
  description?: string
  members: ListMember[]
  permission: 'owner' | 'edit' | 'view' | 'none'
  createdAt: string
  updatedAt: string
}

export interface ListMember {
  userId: string
  role: 'view' | 'edit'
  addedAt: string
}

export interface Ingredient {
  name: string
  quantity?: string
}

export interface Dish {
  id: string
  listId: string
  createdBy: string
  name: string
  description?: string
  requiredIngredients: Ingredient[]
  optionalIngredients: Ingredient[]
  tags: string[]
  prepTimeMinutes?: number
  isQuick: boolean
  yieldsLeftovers: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Friendship {
  id: string
  otherUser: User
  status: 'pending' | 'accepted' | 'declined'
  direction: 'sent' | 'received'
  createdAt: string
  updatedAt: string
}
