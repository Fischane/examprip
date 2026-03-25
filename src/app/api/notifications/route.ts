export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Notification } from '@/models/Notification'

export async function GET() {
  await connectDB()
  const notifications = await Notification.find().sort({ createdAt: -1 })
  return NextResponse.json(notifications)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const n = await Notification.create(body)
  return NextResponse.json(n)
}
