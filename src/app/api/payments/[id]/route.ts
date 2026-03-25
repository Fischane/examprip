export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Payment } from '@/models/Payment'
import { User } from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { status, reviewNote, planDays } = await req.json()
    // Do NOT populate — keep user as ObjectId
    const payment = await Payment.findById(params.id)
    if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const userId = payment.user // raw ObjectId

    payment.status = status
    payment.reviewNote = reviewNote || ''
    payment.reviewedBy = (session.user as any).id

    if (status === 'approved') {
      const days = planDays || payment.planDays || 30
      const now = new Date()
      const user = await User.findById(userId)
      if (user) {
        const base = user.paidUntil && user.paidUntil > now ? user.paidUntil : now
        const paidUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
        user.isPaid = true
        user.paidUntil = paidUntil
        await user.save()
        console.log('[payment] approved user', userId, 'isPaid=true until', paidUntil)
      } else {
        console.error('[payment] user not found for id:', userId)
      }
    } else if (status === 'rejected') {
      const otherValid = await Payment.findOne({
        user: userId,
        status: 'approved',
        _id: { $ne: payment._id },
      })
      if (!otherValid) {
        await User.findByIdAndUpdate(userId, { isPaid: false })
      }
    }

    await payment.save()
    return NextResponse.json(payment)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
