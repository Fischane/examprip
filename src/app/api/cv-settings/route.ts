export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { SiteSettings } from '@/models/SiteSettings'

export async function GET() {
  noStore()
  try {
    await connectDB()
    let settings = await SiteSettings.findOne().lean()
    if (!settings) settings = await SiteSettings.create({})
    return NextResponse.json(settings)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    await connectDB()
    const settings = await SiteSettings.findOneAndUpdate({}, body, { new: true, upsert: true })
    return NextResponse.json(settings)
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
