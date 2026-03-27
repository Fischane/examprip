import mongoose, { Schema, Document, models } from 'mongoose'

export interface ICVTemplate extends Document {
  name: string
  thumbnailUrl: string
  layoutConfig: object
  defaultContent: object
  isPaid: boolean
  price: number
  isPublished: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CVTemplateSchema = new Schema<ICVTemplate>({
  name: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  layoutConfig: { type: Schema.Types.Mixed, default: {} },
  defaultContent: { type: Schema.Types.Mixed, default: {} },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

CVTemplateSchema.index({ isPaid: 1, isPublished: 1 })

export const CVTemplate = models.CVTemplate || mongoose.model<ICVTemplate>('CVTemplate', CVTemplateSchema)
