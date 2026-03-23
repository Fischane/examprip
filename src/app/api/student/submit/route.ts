import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Result } from '@/models/Result'

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const result = await Result.create({
      user: body.userId,
      exam: body.examId,
      score: body.score,
      totalMarks: body.totalMarks,
      timeTaken: body.timeTaken,
      passed: body.passed,
      attempts: body.attempts,
    })
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
