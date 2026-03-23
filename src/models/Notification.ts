import mongoose, { Schema, Document, models } from 'mongoose'

export interface INotification extends Document {
  title: string
  message: string
  targetRole: 'all' | 'student' | 'admin'
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetRole: { type: String, enum: ['all', 'student', 'admin'], default: 'all' },
}, { timestamps: true })

export const Notification = models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
