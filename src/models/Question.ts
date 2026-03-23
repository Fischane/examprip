import mongoose, { Schema, Document, models } from 'mongoose'

export interface IQuestion extends Document {
  question: string
  type: 'MCQ' | 'MULTI' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctAnswer: string        // single answer (for MCQ/TRUE_FALSE)
  correctAnswers?: string[]    // multiple answers (for MULTI type)
  explanationA?: string
  explanationB?: string
  explanationC?: string
  explanationD?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  subject: mongoose.Types.ObjectId
  topic?: string
  imageUrl?: string
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'], default: 'MCQ' },
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  correctAnswer: { type: String, required: true },
  explanationA: String,
  explanationB: String,
  explanationC: String,
  explanationD: String,
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic: String,
  imageUrl: String,
}, { timestamps: true })

QuestionSchema.index({ subject: 1 })
QuestionSchema.index({ difficulty: 1, subject: 1 })

export const Question = models.Question || mongoose.model<IQuestion>('Question', QuestionSchema)
