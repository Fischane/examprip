'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Users, TrendingUp, Loader2 } from 'lucide-react'

export default function CVAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cv-analytics')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>

  const stats = [
    { label: 'CVs Created (Month)', value: data?.totalCVs ?? 0, icon: FileText, color: 'blue' },
    { label: 'Downloads (Month)', value: data?.totalDownloads ?? 0, icon: Download, color: 'green' },
    { label: 'Active Users (Month)', value: data?.activeUsers ?? 0, icon: Users, color: 'purple' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">CV Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{s.label}</p>
              <s.icon className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top templates by usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Top Templates by Usage</h2>
          {data?.topTemplates?.length ? (
            <div className="space-y-3">
              {data.topTemplates.map((t: any, i: number) => (
                <div key={t._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                    <span className="text-sm text-gray-700">{t.name || t._id}</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{t.count} CVs</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No data yet</p>}
        </div>

        {/* Top paid templates by revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Top Paid Templates by Revenue</h2>
          {data?.topPaidTemplates?.length ? (
            <div className="space-y-3">
              {data.topPaidTemplates.map((t: any, i: number) => (
                <div key={t._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                    <span className="text-sm text-gray-700">{t.name || t._id}</span>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">{t.revenue} ETB</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No paid template data yet</p>}
        </div>
      </div>
    </div>
  )
}
