export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { connectDB } from '@/lib/mongoose'
import { Payment } from '@/models/Payment'
import { User } from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Admin: get all payments
export async function GET(req: Request) {
  noStore()
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const filter: any = {}
    if (userId) filter.user = userId
    const payments = await Payment.find(filter)
      .populate('user', 'name email department')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(payments)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// Student: submit payment
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const amount = Number(formData.get('amount'))
    const referenceNumber = formData.get('referenceNumber') as string
    const note = formData.get('note') as string
    const planDays = Number(formData.get('planDays') || 30)
    const screenshot = formData.get('screenshot') as File | null

    if (!amount || !referenceNumber) {
      return NextResponse.json({ error: 'Amount and reference number required' }, { status: 400 })
    }

    let screenshotUrl: string | undefined
    if (screenshot && screenshot.size > 0) {
      const bytes = await screenshot.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payments')
      await mkdir(uploadDir, { recursive: true })
      const safeName = `${Date.now()}-${screenshot.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      await writeFile(path.join(uploadDir, safeName), buffer)
      screenshotUrl = `/uploads/payments/${safeName}`
    }

    await connectDB()
    const payment = await Payment.create({
      user: (session.user as any).id,
      amount,
      referenceNumber,
      note: note || '',
      screenshotUrl,
      planDays,
      status: 'pending',
    })

    return NextResponse.json(payment)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
