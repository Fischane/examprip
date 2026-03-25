export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { connectDB } from '@/lib/mongoose'
import { Exam } from '@/models/Exam'
import '@/models/Subject'
import '@/models/Question'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  noStore()
  try {
    await connectDB()
    const exam = await Exam.findById(params.id)
      .populate('subject', 'name')
      .populate('questions', 'question type optionA optionB optionC optionD correctAnswer')
      .lean()
    if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(exam)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const exam = await Exam.findByIdAndUpdate(params.id, body, { new: true })
    return NextResponse.json(exam)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    await Exam.findByIdAndDelete(params.id)
    return NextResponse.json({ message: 'Deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
