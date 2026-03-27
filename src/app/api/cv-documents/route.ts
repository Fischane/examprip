export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { CVDocument } from '@/models/CVDocument'

export async function GET() {
  noStore()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const docs = await CVDocument.find({ user: (session.user as any).id })
      .sort({ updatedAt: -1 })
      .lean()

    return NextResponse.json(docs)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const userId = (session.user as any).id

    await connectDB()

    const count = await CVDocument.countDocuments({ user: userId, name: body.name })
    const version = count + 1

    const doc = await CVDocument.create({
      ...body,
      user: userId,
      version,
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
