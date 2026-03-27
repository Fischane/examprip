import mongoose, { Schema, Document, models } from 'mongoose'

export interface IFAQ extends Document {
  question: string
  answer: string
  sortOrder: number
  createdAt: Date
}

const FAQSchema = new Schema<IFAQ>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true })

FAQSchema.index({ sortOrder: 1 })

export const FAQ = models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema)
