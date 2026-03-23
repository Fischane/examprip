'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react'

const PLANS = [
  { days: 30, label: '1 Month', price: 150 },
  { days: 90, label: '3 Months', price: 400 },
  { days: 180, label: '6 Months', price: 700 },
  { days: 365, label: '1 Year', price: 1200 },
]

const STATUS_ICON: Record<string, any> = {
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  approved: <CheckCircle className="w-4 h-4 text-green-500" />,
  rejected: <XCircle className="w-4 h-4 text-red-500" />,
}
const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export default function PaymentPage() {
  const { data: session, update: updateSession } = useSession()
  const [payments, setPayments] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0])
  const [form, setForm] = useState({ referenceNumber: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const userId = (session?.user as any)?.id
  const isPaid = (session?.user as any)?.isPaid

  useEffect(() => {
    if (!userId) return
    fetch(`/api/payments?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : []
        setPayments(list)
        // If any payment is approved, refresh session to pick up isPaid
        if (list.some((p: any) => p.status === 'approved')) {
          updateSession()
        }
      })
  }, [userId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.referenceNumber) return
    setSubmitting(true)
    setError('')
    const fd = new FormData()
    fd.append('amount', String(selectedPlan.price))
    fd.append('referenceNumber', form.referenceNumber)
    fd.append('note', form.note)
    fd.append('planDays', String(selectedPlan.days))
    const file = fileRef.current?.files?.[0]
    if (file) fd.append('screenshot', file)

    const res = await fetch('/api/payments', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setPayments(prev => [data, ...prev])
      setSuccess(true)
      setForm({ referenceNumber: '', note: '' })
      if (fileRef.current) fileRef.current.value = ''
    } else {
      setError(data.error || 'Submission failed')
    }
    setSubmitting(false)
  }

  const hasPending = payments.some(p => p.status === 'pending')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment & Subscription</h1>
      <p className="text-gray-500 text-sm mb-8">Pay offline and submit your reference number for admin approval.</p>

      {/* Active subscription banner */}
      {isPaid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Subscription Active</p>
            <p className="text-sm text-green-600">You have full access to all exams and materials.</p>
          </div>
        </div>
      )}

      {/* Payment instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-blue-900 mb-2">How to Pay</h2>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Transfer the amount to our bank account</li>
          <li>Note your transaction reference number</li>
          <li>Submit the form below with your reference</li>
          <li>Admin will approve within 24 hours</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-blue-200 text-sm text-blue-900">
          <p className="font-medium">Bank: Commercial Bank of Ethiopia (CBE)</p>
          <p>Account: <span className="font-mono font-semibold">1000474138694</span></p>
          <p>Name: Fiseha Chane</p>
        </div>
      </div>

      {/* Plan selection */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Select Plan</h2>
        <div className="grid grid-cols-2 gap-3">
          {PLANS.map(plan => (
            <button key={plan.days} onClick={() => setSelectedPlan(plan)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${selectedPlan.days === plan.days ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <p className="font-bold text-gray-900">{plan.label}</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{plan.price} <span className="text-sm font-normal text-gray-500">ETB</span></p>
            </button>
          ))}
        </div>
      </div>

      {/* Submit form */}
      {!hasPending ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Submit Payment Proof</h2>
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
              ✅ Submitted! Admin will review within 24 hours.
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Transaction Reference Number *</label>
              <input value={form.referenceNumber} onChange={e => setForm({ ...form, referenceNumber: e.target.value })}
                required placeholder="e.g. FT24123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Screenshot (optional)</label>
              <input ref={fileRef} type="file" accept="image/*"
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Note (optional)</label>
              <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                placeholder="Any additional info..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm flex justify-between">
              <span className="text-gray-600">Plan: {selectedPlan.label}</span>
              <span className="font-bold text-gray-900">{selectedPlan.price} ETB</span>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
          <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="font-semibold text-yellow-800">Payment Under Review</p>
          <p className="text-sm text-yellow-600 mt-1">Your payment is pending admin approval. Please wait up to 24 hours.</p>
        </div>
      )}

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-900 mb-3">Payment History</h2>
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p._id} className={`rounded-xl border p-4 ${STATUS_STYLE[p.status]}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {STATUS_ICON[p.status]}
                    <span className="font-semibold capitalize">{p.status}</span>
                  </div>
                  <span className="font-bold">{p.amount} {p.currency}</span>
                </div>
                <div className="text-xs space-y-0.5 opacity-80">
                  <p>Ref: <span className="font-mono">{p.referenceNumber}</span></p>
                  <p>Plan: {p.planDays} days · {new Date(p.createdAt).toLocaleDateString()}</p>
                  {p.reviewNote && <p>Note: {p.reviewNote}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
