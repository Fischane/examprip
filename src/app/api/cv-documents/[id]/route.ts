export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { CVDocument } from '@/models/CVDocument'
import { CoverLetter } from '@/models/CoverLetter'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  noStore()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const doc = await CVDocument.findOne({
      _id: params.id,
      user: (session.user as any).id,
    }).lean()

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(doc)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    await connectDB()
    const doc = await CVDocument.findOneAndUpdate(
      { _id: params.id, user: (session.user as any).id },
      { $set: body },
      { new: true }
    ).lean()

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(doc)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const doc = await CVDocument.findOneAndDelete({
      _id: params.id,
      user: (session.user as any).id,
    })

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await CoverLetter.deleteMany({ cvDocumentId: params.id })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
