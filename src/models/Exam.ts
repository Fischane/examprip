import mongoose, { Schema, Document, models } from 'mongoose'

export interface IExam extends Document {
  title: string
  subject: mongoose.Types.ObjectId
  questions: mongoose.Types.ObjectId[]
  timeLimit: number
  passingMark: number
  type: string
  isActive: boolean
  description?: string
}

const ExamSchema = new Schema<IExam>({
  title: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  timeLimit: { type: Number, default: 60 },
  passingMark: { type: Number, default: 50 },
  type: { type: String, enum: ['MOCK', 'PRACTICE', 'DAILY'], default: 'MOCK' },
  isActive: { type: Boolean, default: true },
  description: String,
}, { timestamps: true })

export const Exam = models.Exam || mongoose.model<IExam>('Exam', ExamSchema)
