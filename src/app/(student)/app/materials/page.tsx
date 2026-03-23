'use client'

import { useEffect, useState } from 'react'
import { Download, Search, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clearPaymentCache } from '@/hooks/usePaymentGuard'

const FILE_ICONS: Record<string, string> = {
  pdf: '📄', ppt: '📊', pptx: '📊', doc: '📝', docx: '📝',
  xls: '📈', xlsx: '📈', txt: '📃', zip: '🗜️', rar: '🗜️',
}
function getExt(name: string) { return name.split('.').pop()?.toLowerCase() ?? '' }
function getIcon(name: string) { return FILE_ICONS[getExt(name)] ?? '📁' }
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function MaterialsPage() {
  const router = useRouter()
  const [materials, setMaterials] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/payments/status').then(r => r.json()),
      fetch('/api/materials').then(r => r.json()),
    ]).then(([status, data]) => {
      if (!status.isPaid) { clearPaymentCache(); router.replace('/app/payment'); return }
      setMaterials(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
    getExt(m.fileName).includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-sm text-gray-500 mt-0.5">Download and study the uploaded resources</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, subject or file type..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <div className="text-center py-16 text-gray-400">Loading materials...</div>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{search ? 'No materials match your search.' : 'No study materials available yet.'}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(m => (
          <div key={m._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl flex-shrink-0">{getIcon(m.fileName)}</span>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{m.title}</h3>
                {m.subject?.name && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{m.subject.name}</span>
                )}
              </div>
            </div>
            {m.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{m.description}</p>}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <span className="uppercase font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{getExt(m.fileName)}</span>
              <span>{fmtSize(m.fileSize)}</span>
              <span>·</span>
              <span>{new Date(m.createdAt).toLocaleDateString()}</span>
            </div>
            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download / Open
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
