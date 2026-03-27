'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, Loader2 } from 'lucide-react'
import TemplateForm from '@/components/admin/cv/TemplateForm'

export default function AdminCVTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [preview, setPreview] = useState<any>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/cv-templates?filter=all&admin=1')
    const data = await res.json()
    setTemplates(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave(data: any) {
    const url = editing ? `/api/cv-templates/${editing._id}` : '/api/cv-templates'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
    setShowForm(false); setEditing(null); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this template?')) return
    setDeleting(id)
    const res = await fetch(`/api/cv-templates/${id}`, { method: 'DELETE' })
    if (res.status === 409) {
      const d = await res.json()
      if (confirm(`${d.error} Force delete?`)) {
        await fetch(`/api/cv-templates/${id}?force=true`, { method: 'DELETE' })
      }
    }
    setDeleting(null); load()
  }

  async function togglePublish(t: any) {
    await fetch(`/api/cv-templates/${t._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !t.isPublished }),
    })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CV Templates</h1>
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Template
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Template</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {templates.map(t => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {t.thumbnailUrl
                        ? <img src={t.thumbnailUrl} className="w-10 h-10 rounded object-cover" />
                        : <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400">📄</div>}
                      <span className="font-medium text-gray-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.isPaid ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {t.isPaid ? 'Paid' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.isPaid ? `${t.price} ETB` : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(t)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer ${t.isPublished ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setPreview(t)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setEditing(t); setShowForm(true) }} className="p-1.5 hover:bg-gray-100 rounded text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t._id)} disabled={deleting === t._id} className="p-1.5 hover:bg-gray-100 rounded text-red-500 disabled:opacity-50">
                        {deleting === t._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No templates yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(showForm || editing) && (
        <TemplateForm initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null) }} />
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl p-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">{preview.name}</h3>
            {preview.thumbnailUrl
              ? <img src={preview.thumbnailUrl} className="w-full rounded-lg" />
              : <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-4xl">📄</div>}
            <button onClick={() => setPreview(null)} className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
