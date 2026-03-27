import mongoose, { Schema, Document, models } from 'mongoose'

export interface ICoverLetter extends Document {
  user: mongoose.Types.ObjectId
  cvDocumentId: mongoose.Types.ObjectId
  recipientName: string
  recipientTitle: string
  companyName: string
  paragraphs: string[]
  sectionOrder: string[]
  links: { linkedin?: string; github?: string; portfolio?: string }
  styling: {
    colorScheme: string
    font: string
    accentColor: string
  }
  createdAt: Date
  updatedAt: Date
}

const CoverLetterSchema = new Schema<ICoverLetter>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cvDocumentId: { type: Schema.Types.ObjectId, ref: 'CVDocument', required: true },
  recipientName: { type: String, required: true },
  recipientTitle: { type: String, default: '' },
  companyName: { type: String, default: '' },
  paragraphs: [{ type: String }],
  sectionOrder: [{ type: String }],
  links: {
    linkedin: String,
    github: String,
    portfolio: String,
  },
  styling: {
    colorScheme: { type: String, default: 'default' },
    font: { type: String, default: 'inter' },
    accentColor: { type: String, default: '#000000' },
  },
}, { timestamps: true })

CoverLetterSchema.index({ user: 1 })
CoverLetterSchema.index({ cvDocumentId: 1 })

export const CoverLetter = models.CoverLetter || mongoose.model<ICoverLetter>('CoverLetter', CoverLetterSchema)
