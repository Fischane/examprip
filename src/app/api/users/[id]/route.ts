import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User } from '@/models/User'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const user = await User.findByIdAndUpdate(params.id, body, { new: true }).select('-password')
  return NextResponse.json(user)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB()
  await User.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'Deleted' })
}
