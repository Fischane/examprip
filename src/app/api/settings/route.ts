import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ siteName: 'ExamPrep', defaultTimeLimit: 60, defaultPassingMark: 60 })
}

export async function POST() {
  return NextResponse.json({ success: true })
}
