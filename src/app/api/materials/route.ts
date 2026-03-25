export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Material } from '@/models/Material'
import '@/models/Subject'
import '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    await connectDB()
    const materials = await Material.find()
      .populate('subject', 'name')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(materials)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const subject = formData.get('subject') as string

    if (!file || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materials')
    await mkdir(uploadDir, { recursive: true })

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    await writeFile(path.join(uploadDir, safeName), buffer)

    await connectDB()
    const material = await Material.create({
      title,
      description: description || '',
      fileName: file.name,
      fileUrl: `/uploads/materials/${safeName}`,
      fileType: file.type || file.name.split('.').pop() || 'unknown',
      fileSize: file.size,
      subject: subject || undefined,
      uploadedBy: (session.user as any).id,
    })

    return NextResponse.json(material)
  } catch (err) {
    console.error('POST /api/materials error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
