'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2, FileText, Download, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CVDashboardPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<any[]>([])
  const [downloads, setDownloads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/cv-documents').then(r => r.json()),
      fetch('/api/download-records').then(r => r.json()),
    ]).then(([d, dl]) => {
      setDocs(Array.isArray(d) ? d : [])
      setDownloads(Array.isArray(dl) ? dl : [])
    }).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this CV and its cover letter?')) return
    setDeleting(id)
    const res = await fetch(`/api/cv-documents/${id}`, { method: 'DELETE' })
    if (res.ok) setDocs(docs.filter(d => d._id !== id))
    setDeleting(null)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My CVs</h1>
          <p className="text-sm text-gray-500">Manage your saved CVs and cover letters</p>
        </div>
        <Link href="/app/cv/templates"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New CV
        </Link>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No CVs yet</p>
          <p className="text-sm text-gray-400 mt-1">Pick a template to get started</p>
          <Link href="/app/cv/templates" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Browse Templates
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {docs.map(doc => (
            <div key={doc._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-400">v{doc.version} · {new Date(doc.updatedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">CV</span>
              </div>
              {doc.data?.title && <p className="text-xs text-gray-500 mb-3">{doc.data.title}</p>}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => router.push(`/app/cv/editor/${doc._id}`)}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <Link href={`/app/cv/cover-letter/${doc._id}`}
                  className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100">
                  <FileText className="w-3 h-3" /> Cover Letter
                </Link>
                <button onClick={() => handleDelete(doc._id)} disabled={deleting === doc._id}
                  className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 disabled:opacity-50">
                  {deleting === doc._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download history */}
      {downloads.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Download History</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {downloads.slice(0, 20).map((dl: any) => (
              <div key={dl._id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-700">{dl.type === 'cover-letter' ? 'Cover Letter' : 'CV'}</p>
                    <p className="text-xs text-gray-400">{new Date(dl.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
