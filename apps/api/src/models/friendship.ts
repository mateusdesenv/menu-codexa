import mongoose, { Schema } from 'mongoose'

export interface IFriendship {
  _id: mongoose.Types.ObjectId
  requesterId: mongoose.Types.ObjectId
  recipientId: mongoose.Types.ObjectId
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
  updatedAt: Date
}

const FriendshipSchema = new Schema<IFriendship>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: true },
)

FriendshipSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true })

export const Friendship = mongoose.model<IFriendship>('Friendship', FriendshipSchema)
