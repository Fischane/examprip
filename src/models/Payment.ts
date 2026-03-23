import mongoose, { Schema, Document, models } from 'mongoose'

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId
  amount: number
  currency: string
  referenceNumber: string
  screenshotUrl?: string
  note?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: mongoose.Types.ObjectId
  reviewNote?: string
  planDays: number
  createdAt: Date
}

const PaymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'ETB' },
  referenceNumber: { type: String, required: true },
  screenshotUrl: String,
  note: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNote: String,
  planDays: { type: Number, default: 30 },
}, { timestamps: true })

PaymentSchema.index({ user: 1, status: 1 })
PaymentSchema.index({ status: 1, createdAt: -1 })

export const Payment = models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)
