import mongoose, { Schema } from 'mongoose'

export interface IListMember {
  userId: mongoose.Types.ObjectId
  role: 'view' | 'edit'
  addedAt: Date
}

export interface IList {
  _id: mongoose.Types.ObjectId
  ownerId: mongoose.Types.ObjectId
  name: string
  description?: string
  members: IListMember[]
  createdAt: Date
  updatedAt: Date
}

const ListMemberSchema = new Schema<IListMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['view', 'edit'], required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const ListSchema = new Schema<IList>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    members: { type: [ListMemberSchema], default: [] },
  },
  { timestamps: true },
)

export const List = mongoose.model<IList>('List', ListSchema)
