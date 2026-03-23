'use client'

import { useEffect, useState } from 'react'
import { Users, BookOpen, TrendingUp, CheckCircle } from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => { fetch('/api/analytics').then(r => r.json()).then(setData) }, [])

  if (!data) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: data.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Exams', value: data.totalExams, icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
          { label: 'Total Attempts', value: data.totalAttempts, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Pass Rate', value: `${data.passRate}%`, icon: CheckCircle, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Average Score</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-100 rounded-full h-4">
            <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${data.avgScore}%` }} />
          </div>
          <span className="text-lg font-bold text-gray-900 w-12">{data.avgScore}%</span>
        </div>
      </div>
    </div>
  )
}
