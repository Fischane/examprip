import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User } from '@/models/User'

export async function GET() {
  await connectDB()
  const users = await User.find().select('-password').sort({ createdAt: -1 })
  return NextResponse.json(users)
}
