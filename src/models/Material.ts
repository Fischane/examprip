import mongoose, { Schema, Document, models } from 'mongoose'

export interface IMaterial extends Document {
  title: string
  description?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  subject?: mongoose.Types.ObjectId
  uploadedBy: mongoose.Types.ObjectId
  createdAt: Date
}

const MaterialSchema = new Schema<IMaterial>({
  title: { type: String, required: true },
  description: String,
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

MaterialSchema.index({ subject: 1 })
MaterialSchema.index({ createdAt: -1 })

export const Material = models.Material || mongoose.model<IMaterial>('Material', MaterialSchema)
