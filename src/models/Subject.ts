import mongoose, { Schema, Document, models } from 'mongoose'

export interface ISubject extends Document {
  name: string
  description?: string
}

const SubjectSchema = new Schema<ISubject>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
}, { timestamps: true })

export const Subject = models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema)
