import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Subject } from '@/models/Subject'

export async function GET() {
  await connectDB()
  const subjects = await Subject.find().sort({ name: 1 })
  return NextResponse.json(subjects)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const subject = await Subject.create(body)
  return NextResponse.json(subject)
}
