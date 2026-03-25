export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { connectDB } from '@/lib/mongoose'
import { Exam } from '@/models/Exam'
import '@/models/Subject' // must be imported so Mongoose registers the schema before populate

export async function GET() {
  noStore()
  try {
    await connectDB()
    const exams = await Exam.find()
      .select('title subject questions timeLimit passingMark type description isActive createdAt')
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .lean()
    const res = NextResponse.json(exams)
    res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res
  } catch (err) {
    console.error('GET /api/exams error:', err)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const exam = await Exam.create(body)
    return NextResponse.json(exam)
  } catch (err) {
    console.error('POST /api/exams error:', err)
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
  }
}
