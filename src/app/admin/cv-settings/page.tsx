'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const lbl = 'text-xs font-medium text-gray-600 mb-1 block'

export default function CVSettingsPage() {
  const [tab, setTab] = useState<'appearance' | 'faqs'>('appearance')
  const [settings, setSettings] = useState<any>({ colorScheme: 'default', logoUrl: '', bannerText: '' })
  const [faqs, setFaqs] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/cv-settings').then(r => r.json()),
      fetch('/api/faqs').then(r => r.json()),
    ]).then(([s, f]) => {
      if (s && !s.error) setSettings(s)
      if (Array.isArray(f)) setFaqs(f)
    }).finally(() => setLoading(false))
  }, [])

  async function saveSettings() {
    setSaving(true)
    await fetch('/api/cv-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function saveFAQ(faq: any) {
    const url = faq._id ? `/api/faqs/${faq._id}` : '/api/faqs'
    const method = faq._id ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(faq) })
    const data = await res.json()
    if (faq._id) {
      setFaqs(faqs.map(f => f._id === faq._id ? data : f))
    } else {
      setFaqs([...faqs, data])
    }
  }

  async function deleteFAQ(id: string) {
    await fetch(`/api/faqs/${id}`, { method: 'DELETE' })
    setFaqs(faqs.filter(f => f._id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">CV Settings</h1>

      <div className="flex gap-2 mb-6">
        {(['appearance', 'faqs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t === 'faqs' ? 'FAQs' : 'Appearance'}
          </button>
        ))}
      </div>

      {tab === 'appearance' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-lg">
          <div className="space-y-4">
            <div><label className={lbl}>Default Color Scheme</label>
              <select value={settings.colorScheme} onChange={e => setSettings({ ...settings, colorScheme: e.target.value })} className={inp}>
                {['default', 'blue', 'green', 'purple', 'minimal'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Logo URL</label><input value={settings.logoUrl || ''} onChange={e => setSettings({ ...settings, logoUrl: e.target.value })} className={inp} placeholder="https://..." /></div>
            <div><label className={lbl}>Banner Text</label><input value={settings.bannerText || ''} onChange={e => setSettings({ ...settings, bannerText: e.target.value })} className={inp} placeholder="Welcome to CV Builder..." /></div>
            <button onClick={saveSettings} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {tab === 'faqs' && (
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQRow key={faq._id || i} faq={faq} onSave={saveFAQ} onDelete={() => faq._id && deleteFAQ(faq._id)} />
          ))}
          <button onClick={() => setFaqs([...faqs, { question: '', answer: '', sortOrder: faqs.length }])}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 w-full justify-center">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      )}
    </div>
  )
}

function FAQRow({ faq, onSave, onDelete }: { faq: any; onSave: (f: any) => void; onDelete: () => void }) {
  const [q, setQ] = useState(faq.question)
  const [a, setA] = useState(faq.answer)
  const [order, setOrder] = useState(faq.sortOrder ?? 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="grid grid-cols-1 gap-2 mb-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Question" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <textarea value={a} onChange={e => setA(e.target.value)} placeholder="Answer" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} placeholder="Sort order" className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ ...faq, question: q, answer: a, sortOrder: order })}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">Save</button>
        <button onClick={onDelete} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  )
}
