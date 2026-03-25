export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { connectDB } from '@/lib/mongoose'
import { Result } from '@/models/Result'
import '@/models/Exam'
import '@/models/User'

export async function GET(req: Request) {
  noStore()
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const filter: any = {}
    if (userId) filter.user = userId
    const results = await Result.find(filter)
      .select('score totalMarks passed timeTaken createdAt exam user')
      .populate('exam', 'title type')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
