import mongoose, { Schema, Document, models } from 'mongoose'

interface Experience {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

interface Education {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
}

interface Reference {
  name: string
  position: string
  company: string
  contact: string
}

interface Skill {
  name: string
  level?: string
}

export interface ICVDocument extends Document {
  user: mongoose.Types.ObjectId
  templateId: mongoose.Types.ObjectId
  name: string
  version: number
  data: {
    name: string
    title: string
    phone: string
    phone2: string
    website: string
    email: string
    address: string
    summary: string
    experiences: Experience[]
    educations: Education[]
    references: Reference[]
    skills: Skill[]
    photo: string
    links: { linkedin?: string; github?: string; portfolio?: string }
    icons: { section: string; iconName: string }[]
  }
  styling: {
    colorScheme: string
    font: string
    accentColor: string
    backgroundColor: string
  }
  createdAt: Date
  updatedAt: Date
}

const CVDocumentSchema = new Schema<ICVDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'CVTemplate', required: true },
  name: { type: String, required: true },
  version: { type: Number, default: 1 },
  data: {
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    phone: { type: String, default: '' },
    phone2: { type: String, default: '' },
    website: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    summary: { type: String, default: '' },
    experiences: [{ type: Schema.Types.Mixed }],
    educations: [{ type: Schema.Types.Mixed }],
    references: [{ type: Schema.Types.Mixed }],
    skills: [{ type: Schema.Types.Mixed }],
    photo: { type: String, default: '' },
    links: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
    icons: [{ section: String, iconName: String }],
  },
  styling: {
    colorScheme: { type: String, default: 'default' },
    font: { type: String, default: 'inter' },
    accentColor: { type: String, default: '#000000' },
    backgroundColor: { type: String, default: '#ffffff' },
  },
}, { timestamps: true })

CVDocumentSchema.index({ user: 1, updatedAt: -1 })
CVDocumentSchema.index({ user: 1, name: 1 })

export const CVDocument = models.CVDocument || mongoose.model<ICVDocument>('CVDocument', CVDocumentSchema)
