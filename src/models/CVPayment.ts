import mongoose, { Schema, Document, models } from 'mongoose'

export interface ICVPayment extends Document {
  user: mongoose.Types.ObjectId
  template: mongoose.Types.ObjectId
  amount: number
  currency: string
  referenceNumber: string
  screenshotUrl?: string
  note?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: mongoose.Types.ObjectId
  reviewNote?: string
  createdAt: Date
}

const CVPaymentSchema = new Schema<ICVPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  template: { type: Schema.Types.ObjectId, ref: 'CVTemplate', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'ETB' },
  referenceNumber: { type: String, required: true },
  screenshotUrl: String,
  note: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNote: String,
}, { timestamps: true })

CVPaymentSchema.index({ user: 1, status: 1 })
CVPaymentSchema.index({ user: 1, template: 1 })
CVPaymentSchema.index({ status: 1, createdAt: -1 })

export const CVPayment = models.CVPayment || mongoose.model<ICVPayment>('CVPayment', CVPaymentSchema)
