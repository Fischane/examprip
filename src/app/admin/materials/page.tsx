'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Trash2, FileText, File, Download, Plus } from 'lucide-react'

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
  const [materials, setMaterials] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({ title: '', description: '', subject: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/materials').then(r => r.json()).then(d => setMaterials(Array.isArray(d) ? d : []))
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : []))
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file || !form.title) return
    setUploading(true)
    setStatus('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', form.title)
    fd.append('description', form.description)
    if (form.subject) fd.append('subject', form.subject)
    const res = await fetch('/api/materials', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setMaterials(prev => [data, ...prev])
      setShowModal(false)
      setForm({ title: '', description: '', subject: '' })
      if (fileRef.current) fileRef.current.value = ''
    } else {
      setStatus(data.error || 'Upload failed')
    }
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this material?')) return
    await fetch(`/api/materials/${id}`, { method: 'DELETE' })
    setMaterials(prev => prev.filter(m => m._id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Materials ({materials.length})</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Upload Material
        </button>
      </div>

      {materials.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Upload className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No materials yet. Upload your first file.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(m => (
          <div key={m._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{getIcon(m.fileName)}</span>
              <button onClick={() => handleDelete(m._id)} className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 truncate">{m.title}</h3>
            {m.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{m.description}</p>}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <span className="uppercase font-medium text-blue-600">{getExt(m.fileName)}</span>
              <span>·</span>
              <span>{fmtSize(m.fileSize)}</span>
              {m.subject?.name && <><span>·</span><span>{m.subject.name}</span></>}
            </div>
            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" download
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
              <Download className="w-3.5 h-3.5" /> Download / View
            </a>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Study Material</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                  placeholder="e.g. Chapter 1 - Introduction to IS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..." rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Subject</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All subjects</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">File * (PDF, PPT, Word, Excel, etc.)</label>
                <input ref={fileRef} type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.png,.jpg,.jpeg"
                  required className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              {status && <p className="text-sm text-red-600">{status}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setStatus('') }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={uploading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
