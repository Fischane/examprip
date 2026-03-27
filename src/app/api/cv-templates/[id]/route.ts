export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { CVTemplate } from '@/models/CVTemplate'
import { CVDocument } from '@/models/CVDocument'

type P = { params: { id: string } }

export async function GET(_: Request, { params }: P) {
  noStore()
  try {
    await connectDB()
    const t = await CVTemplate.findById(params.id).lean()
    if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(t)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PUT(req: Request, { params }: P) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const t = await CVTemplate.findByIdAndUpdate(params.id, body, { new: true })
    return NextResponse.json(t)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(req: Request, { params }: P) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const force = searchParams.get('force') === 'true'
    await connectDB()
    const count = await CVDocument.countDocuments({ templateId: params.id })
    if (count > 0 && !force)
      return NextResponse.json({ error: 'Template in use', count }, { status: 409 })
    await CVTemplate.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
