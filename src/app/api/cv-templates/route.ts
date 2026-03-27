export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { CVTemplate } from '@/models/CVTemplate'

export async function GET(req: Request) {
  noStore()
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter')
    const isAdmin = searchParams.get('admin') === '1'
    const session = isAdmin ? await getServerSession(authOptions) : null
    const query: any = isAdmin && session && (session.user as any).role === 'admin' ? {} : { isPublished: true }
    if (filter === 'free') query.isPaid = false
    if (filter === 'paid') query.isPaid = true
    const templates = await CVTemplate.find(query).sort({ createdAt: -1 }).lean()
    return NextResponse.json(templates)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const template = await CVTemplate.create({ ...body, createdBy: (session.user as any).id })
    return NextResponse.json(template, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
