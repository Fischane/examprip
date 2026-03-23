'use client'

import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', message: '', targetRole: 'all' })
  const [sending, setSending] = useState(false)

  useEffect(() => { fetch('/api/notifications').then(r => r.json()).then(setNotifications) }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    const res = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const n = await res.json()
    setNotifications([n, ...notifications])
    setForm({ title: '', message: '', targetRole: 'all' })
    setSending(false)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Send Notification</h2>
        <form onSubmit={handleSend} className="space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder="Message"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" />
          <div className="flex gap-3">
            <select value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Users</option>
              <option value="student">Students Only</option>
              <option value="admin">Admins Only</option>
            </select>
            <button type="submit" disabled={sending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
              <Send className="w-4 h-4" />{sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n._id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900">{n.title}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{n.targetRole}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
            <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
