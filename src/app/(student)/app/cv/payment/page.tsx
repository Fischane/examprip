'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CreditCard, Clock, CheckCircle, Loader2 } from 'lucide-react'

function CVPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const templateId = searchParams.get('templateId') || ''
  const [template, setTemplate] = useState<any>(null)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!templateId) return
    fetch(`/api/cv-templates/${templateId}`)
      .then(r => r.json())
      .then(t => setTemplate(t))
      .catch(() => {})
  }, [templateId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!referenceNumber || !templateId) return
    setSubmitting(true); setError('')
    const fd = new FormData()
    fd.append('templateId', templateId)
    fd.append('referenceNumber', referenceNumber)
    fd.append('note', note)
    const file = fileRef.current?.files?.[0]
    if (file) fd.append('screenshot', file)

    const res = await fetch('/api/cv-payments', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setSuccess(true)
    } else {
      setError(data.error || 'Submission failed')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Unlock Template</h1>
      <p className="text-sm text-gray-500 mb-6">Pay offline and submit your reference number for admin approval.</p>

      {template && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-4">
          {template.thumbnailUrl && <img src={template.thumbnailUrl} className="w-16 h-16 rounded-lg object-cover" />}
          <div>
            <p className="font-semibold text-blue-900">{template.name}</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{template.price} <span className="text-sm font-normal text-gray-500">ETB</span></p>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm">
        <p className="font-semibold text-gray-800 mb-2">How to Pay</p>
        <ol className="text-gray-600 space-y-1 list-decimal list-inside text-xs">
          <li>Transfer the amount to our bank account</li>
          <li>Note your transaction reference number</li>
          <li>Submit the form below</li>
          <li>Admin will approve within 24 hours</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-700">
          <p className="font-medium">Bank: Commercial Bank of Ethiopia (CBE)</p>
          <p>Account: <span className="font-mono font-semibold">1000474138694</span></p>
          <p>Name: Fiseha Chane</p>
        </div>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">Payment Submitted!</p>
          <p className="text-sm text-green-600 mt-1">Admin will review within 24 hours. You'll get access once approved.</p>
          <button onClick={() => router.push('/app/cv/templates')} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            Back to Templates
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Transaction Reference Number *</label>
              <input value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} required
                placeholder="e.g. FT24123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Screenshot (optional)</label>
              <input ref={fileRef} type="file" accept="image/*"
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Note (optional)</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Any additional info..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function CVPaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}>
      <CVPaymentContent />
    </Suspense>
  )
}
