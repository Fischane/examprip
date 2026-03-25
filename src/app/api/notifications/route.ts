export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { connectDB } from '@/lib/mongoose'
import { Notification } from '@/models/Notification'

export async function GET() {
  noStore()
  try {
    await connectDB()
    const notifications = await Notification.find().sort({ createdAt: -1 })
    return NextResponse.json(notifications)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const n = await Notification.create(body)
    return NextResponse.json(n)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
