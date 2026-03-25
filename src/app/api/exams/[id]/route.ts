export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Exam } from '@/models/Exam'
import '@/models/Subject'
import '@/models/Question'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const exam = await Exam.findById(params.id)
    .populate('subject', 'name')
    .populate('questions', 'question type optionA optionB optionC optionD correctAnswer')
    .lean()
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(exam)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const exam = await Exam.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(exam)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB()
  await Exam.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'Deleted' })
}
