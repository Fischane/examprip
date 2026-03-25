export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Question } from '@/models/Question'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const q = await Question.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(q)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB()
  await Question.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'Deleted' })
}
