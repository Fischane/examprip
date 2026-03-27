'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Props {
  initial?: any
  onSave: (data: any) => Promise<void>
  onClose: () => void
}

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const lbl = 'text-xs font-medium text-gray-600 mb-1 block'

export default function TemplateForm({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl || '')
  const [isPaid, setIsPaid] = useState(initial?.isPaid || false)
  const [price, setPrice] = useState(initial?.price || 0)
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false)
  const [defaultContent, setDefaultContent] = useState(initial?.defaultContent ? JSON.stringify(initial.defaultContent, null, 2) : '{}')
  const [layoutConfig, setLayoutConfig] = useState(initial?.layoutConfig ? JSON.stringify(initial.layoutConfig, null, 2) : '{}')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    let dc: any, lc: any
    try { dc = JSON.parse(defaultContent) } catch { setError('Invalid JSON in Default Content'); return }
    try { lc = JSON.parse(layoutConfig) } catch { setError('Invalid JSON in Layout Config'); return }
    setSaving(true)
    try {
      await onSave({ name, thumbnailUrl, isPaid, price: isPaid ? Number(price) : 0, isPublished, defaultContent: dc, layoutConfig: lc })
    } catch (err: any) {
      setError(err.message || 'Save failed')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{initial ? 'Edit Template' : 'Add Template'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{error}</div>}
          <div><label className={lbl}>Template Name *</label><input value={name} onChange={e => setName(e.target.value)} required className={inp} /></div>
          <div><label className={lbl}>Thumbnail URL</label><input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} className={inp} placeholder="https://..." /></div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="rounded" />
              Paid Template
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded" />
              Published
            </label>
          </div>
          {isPaid && (
            <div><label className={lbl}>Price (ETB)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} className={inp} /></div>
          )}
          <div>
            <label className={lbl}>Default Content (JSON)</label>
            <textarea value={defaultContent} onChange={e => setDefaultContent(e.target.value)} rows={4} className={`${inp} font-mono text-xs`} />
          </div>
          <div>
            <label className={lbl}>Layout Config (JSON)</label>
            <textarea value={layoutConfig} onChange={e => setLayoutConfig(e.target.value)} rows={3} className={`${inp} font-mono text-xs`} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
