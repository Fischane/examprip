export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkTemplateAccess } from '@/lib/cv-access'

export async function GET(req: Request) {
  noStore()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const templateId = searchParams.get('templateId')
    if (!templateId) return NextResponse.json({ error: 'Missing templateId' }, { status: 400 })
    const accessible = await checkTemplateAccess((session.user as any).id, templateId)
    return NextResponse.json({ accessible })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
