import { connectDB } from '@/lib/mongoose'
import { CVTemplate } from '@/models/CVTemplate'
import { CVPayment } from '@/models/CVPayment'

export async function checkTemplateAccess(userId: string, templateId: string): Promise<boolean> {
  await connectDB()
  const template = await CVTemplate.findById(templateId).lean() as any
  if (!template) return false
  if (!template.isPaid) return true
  const payment = await CVPayment.findOne({
    user: userId,
    template: templateId,
    status: 'approved',
  }).lean()
  return !!payment
}
