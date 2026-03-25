export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongoose'
import { User } from '@/models/User'

export async function POST(req: Request) {
  try {
    const { name, email, password, department } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    await connectDB()
    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    const hashed = await bcrypt.hash(password, 10)
    await User.create({ name, email: email.toLowerCase(), password: hashed, department, role: 'student' })
    return NextResponse.json({ message: 'Registered successfully' })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
