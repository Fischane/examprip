export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { CVPayment } from '@/models/CVPayment'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const payment = await CVPayment.findByIdAndUpdate(
      params.id,
      { status: 'approved', reviewedBy: (session.user as any).id },
      { new: true }
    )
    if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(payment)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
