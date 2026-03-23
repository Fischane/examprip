'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selected, setSelected] = useState<any>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetch('/api/payments').then(r => r.json()).then(d => setPayments(Array.isArray(d) ? d : []))
  }, [])

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)

  async function handleReview(status: 'approved' | 'rejected') {
    if (!selected) return
    setProcessing(true)
    const res = await fetch(`/api/payments/${selected._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNote, planDays: selected.planDays }),
    })
    const updated = await res.json()
    setPayments(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p))
    setSelected(null)
    setReviewNote('')
    setProcessing(false)
  }

  const counts = {
    all: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    approved: payments.filter(p => p.status === 'approved').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">No payments found.</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.user?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{p.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{p.amount} {p.currency}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.referenceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{p.planDays} days</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(p); setReviewNote(p.reviewNote || '') }}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                      <Eye className="w-3.5 h-3.5" /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Review Payment</h2>
            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Student</span><span className="font-medium">{selected.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{selected.user?.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-semibold">{selected.amount} {selected.currency}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-mono">{selected.referenceNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Plan</span><span>{selected.planDays} days</span></div>
              {selected.note && <div className="flex justify-between"><span className="text-gray-500">Note</span><span className="text-right max-w-[60%]">{selected.note}</span></div>}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[selected.status]}`}>{selected.status}</span>
              </div>
              {selected.screenshotUrl && (
                <div>
                  <p className="text-gray-500 mb-1">Screenshot</p>
                  <a href={selected.screenshotUrl} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs">View screenshot →</a>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Review Note (optional)</label>
              <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={2}
                placeholder="e.g. Payment confirmed via CBE transfer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setSelected(null); setReviewNote('') }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleReview('rejected')} disabled={processing || selected.status === 'rejected'}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => handleReview('approved')} disabled={processing || selected.status === 'approved'}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
