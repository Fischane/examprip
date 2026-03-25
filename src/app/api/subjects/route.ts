export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { connectDB } from '@/lib/mongoose'
import { Subject } from '@/models/Subject'

export async function GET() {
  noStore()
  try {
    await connectDB()
    const subjects = await Subject.find().sort({ name: 1 })
    return NextResponse.json(subjects)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const subject = await Subject.create(body)
    return NextResponse.json(subject)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
