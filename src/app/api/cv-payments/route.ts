export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { CVPayment } from '@/models/CVPayment'

export async function GET() {
  noStore()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const payments = await CVPayment.find({ user: (session.user as any).id })
      .populate('template', 'name price')
      .sort({ createdAt: -1 }).lean()
    return NextResponse.json(payments)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { templateId, amount, referenceNumber, note } = await req.json()
    if (!templateId || !amount || !referenceNumber)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    await connectDB()
    const payment = await CVPayment.create({
      user: (session.user as any).id,
      template: templateId,
      amount,
      referenceNumber,
      note: note || '',
      status: 'pending',
    })
    return NextResponse.json(payment, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
