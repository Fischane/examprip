import mongoose, { Schema, Document, models } from 'mongoose'

export interface IDownloadRecord extends Document {
  user: mongoose.Types.ObjectId
  cvDocumentId: mongoose.Types.ObjectId
  type: 'cv' | 'cover-letter'
  createdAt: Date
}

const DownloadRecordSchema = new Schema<IDownloadRecord>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cvDocumentId: { type: Schema.Types.ObjectId, ref: 'CVDocument', required: true },
  type: { type: String, enum: ['cv', 'cover-letter'], required: true },
}, { timestamps: true })

DownloadRecordSchema.index({ user: 1, createdAt: -1 })

export const DownloadRecord = models.DownloadRecord || mongoose.model<IDownloadRecord>('DownloadRecord', DownloadRecordSchema)
