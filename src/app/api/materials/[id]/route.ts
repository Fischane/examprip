import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Material } from '@/models/Material'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const material = await Material.findById(params.id)
    if (!material) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Delete file from disk
    try {
      const filePath = path.join(process.cwd(), 'public', material.fileUrl)
      await unlink(filePath)
    } catch {}

    await Material.findByIdAndDelete(params.id)
    return NextResponse.json({ message: 'Deleted' })
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
