import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Question } from '@/models/Question'

export async function POST(req: Request) {
  await connectDB()
  const { questions } = await req.json()
  const result = await Question.insertMany(questions)
  return NextResponse.json({ inserted: result.length })
}
