export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { CVPayment } from '@/models/CVPayment'

type Params = { params: { id: string } }

// PATCH: admin only — reject a CVPayment
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { reviewNote } = body

    await connectDB()
    const payment = await CVPayment.findByIdAndUpdate(
      params.id,
      { $set: { status: 'rejected', reviewedBy: (session.user as any).id, reviewNote: reviewNote || '' } },
      { new: true }
    ).lean()

    if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(payment)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to reject payment' }, { status: 500 })
  }
}
