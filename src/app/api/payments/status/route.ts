export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { User } from '@/models/User'
import { Payment } from '@/models/Payment'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ isPaid: false })

  await connectDB()
  const userId = (session.user as any).id

  // Fetch user and any approved payment in parallel
  const [user, approvedPayment] = await Promise.all([
    User.findById(userId).select('isPaid paidUntil').lean() as any,
    Payment.findOne({ user: userId, status: 'approved' }).select('planDays').lean() as any,
  ])

  let isPaid = user?.isPaid ?? false
  let paidUntil = user?.paidUntil ?? null

  // Self-heal: if DB says not paid but approved payment exists, fix it
  if (!isPaid && approvedPayment) {
    const days = approvedPayment.planDays || 30
    paidUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    await User.findByIdAndUpdate(userId, { isPaid: true, paidUntil })
    isPaid = true
  }

  return NextResponse.json({ isPaid, paidUntil }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
