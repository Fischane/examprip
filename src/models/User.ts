import mongoose, { Schema, Document, models } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'admin' | 'student'
  department?: string
  isActive: boolean
  isPaid: boolean
  paidUntil?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  department: { type: String },
  isActive: { type: Boolean, default: true },
  isPaid: { type: Boolean, default: false },
  paidUntil: { type: Date },
}, { timestamps: true })

UserSchema.index({ role: 1 })
// email already has unique:true index defined in schema field, no need to add another

export const User = models.User || mongoose.model<IUser>('User', UserSchema)
