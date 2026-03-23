import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Question } from '@/models/Question'
import '@/models/Subject'

export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const filter: any = {}
  if (subject) filter.subject = subject
  const questions = await Question.find(filter)
    .populate('subject', 'name')
    .sort({ createdAt: -1 })
    .lean()
  return NextResponse.json(questions)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const question = await Question.create(body)
  return NextResponse.json(question)
}
