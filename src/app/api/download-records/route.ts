export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { DownloadRecord } from '@/models/DownloadRecord'

export async function GET() {
  noStore()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const records = await DownloadRecord.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 }).lean()
    return NextResponse.json(records)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { cvDocumentId, type } = await req.json()
    await connectDB()
    const record = await DownloadRecord.create({
      user: (session.user as any).id,
      cvDocumentId,
      type: type || 'cv',
    })
    return NextResponse.json(record, { status: 201 })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
