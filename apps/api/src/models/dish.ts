import mongoose, { Schema } from 'mongoose'

export interface IIngredient {
  name: string
  quantity?: string
}

export interface IDish {
  _id: mongoose.Types.ObjectId
  listId: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  name: string
  description?: string
  requiredIngredients: IIngredient[]
  optionalIngredients: IIngredient[]
  tags: string[]
  prepTimeMinutes?: number
  isQuick: boolean
  yieldsLeftovers: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const IngredientSchema = new Schema<IIngredient>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, trim: true },
  },
  { _id: false },
)

const DishSchema = new Schema<IDish>(
  {
    listId: { type: Schema.Types.ObjectId, ref: 'List', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    requiredIngredients: { type: [IngredientSchema], default: [] },
    optionalIngredients: { type: [IngredientSchema], default: [] },
    tags: { type: [String], default: [] },
    prepTimeMinutes: { type: Number, min: 0 },
    isQuick: { type: Boolean, default: false },
    yieldsLeftovers: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
)

DishSchema.index({ name: 'text', description: 'text' })

export const Dish = mongoose.model<IDish>('Dish', DishSchema)
