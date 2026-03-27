import mongoose, { Schema, Document, models } from 'mongoose'

interface SubscriptionPlan {
  name: string
  price: number
  templateIds: mongoose.Types.ObjectId[]
}

export interface ISiteSettings extends Document {
  colorScheme: string
  logoUrl: string
  bannerText: string
  subscriptionPlans: SubscriptionPlan[]
  updatedAt: Date
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  colorScheme: { type: String, default: 'default' },
  logoUrl: { type: String, default: '' },
  bannerText: { type: String, default: '' },
  subscriptionPlans: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    templateIds: [{ type: Schema.Types.ObjectId, ref: 'CVTemplate' }],
  }],
}, { timestamps: true })

export const SiteSettings = models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema)
