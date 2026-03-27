export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { CoverLetter } from '@/models/CoverLetter'

type P = { params: { id: string } }

export async function GET(_: Request, { params }: P) {
  noStore()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const letter = await CoverLetter.findOne({ _id: params.id, user: (session.user as any).id }).lean()
    if (!letter) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(letter)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PUT(req: Request, { params }: P) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    await connectDB()
    const letter = await CoverLetter.findOneAndUpdate(
      { _id: params.id, user: (session.user as any).id },
      { $set: body }, { new: true }
    )
    if (!letter) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(letter)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_: Request, { params }: P) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const letter = await CoverLetter.findOneAndDelete({ _id: params.id, user: (session.user as any).id })
    if (!letter) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
