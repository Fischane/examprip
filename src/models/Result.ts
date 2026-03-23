import mongoose, { Schema, Document, models } from 'mongoose'

export interface IAttempt {
  questionId: mongoose.Types.ObjectId
  selectedAnswer: string
  isCorrect: boolean
}

export interface IResult extends Document {
  user: mongoose.Types.ObjectId
  exam: mongoose.Types.ObjectId
  score: number
  totalMarks: number
  timeTaken: number
  passed: boolean
  attempts: IAttempt[]
  createdAt: Date
}

const ResultSchema = new Schema<IResult>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  timeTaken: { type: Number, default: 0 },
  passed: { type: Boolean, required: true },
  attempts: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: String,
    isCorrect: Boolean,
  }],
}, { timestamps: true })

ResultSchema.index({ user: 1, createdAt: -1 })
ResultSchema.index({ exam: 1 })

export const Result = models.Result || mongoose.model<IResult>('Result', ResultSchema)
