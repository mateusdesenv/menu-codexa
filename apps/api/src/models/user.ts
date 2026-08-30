import mongoose, { Schema } from 'mongoose'

export interface IUser {
  _id: mongoose.Types.ObjectId
  firebaseId: string
  email: string
  name: string
  photoUrl?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    firebaseId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: '' },
  },
  { timestamps: true },
)

export const User = mongoose.model<IUser>('User', UserSchema)
