'use client'

import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setAnalytics).catch(() => {})
    fetch('/api/results').then(r => r.json()).then(setResults).catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{analytics?.totalUsers ?? '-'}</p>
          <p className="text-sm text-gray-500">Total Students</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{analytics?.totalExams ?? '-'}</p>
          <p className="text-sm text-gray-500">Total Exams</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{analytics?.totalAttempts ?? '-'}</p>
          <p className="text-sm text-gray-500">Total Attempts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{analytics ? analytics.avgScore + '%' : '-'}</p>
          <p className="text-sm text-gray-500">Avg Score</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Results</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Exam</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No results yet</td></tr>
            )}
            {results.slice(0, 8).map((r: any) => {
              const pct = r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : 0
              return (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.user?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.exam?.title ?? '-'}</td>
                  <td className="px-4 py-3 font-semibold">{pct}%</td>
                  <td className="px-4 py-3">
                    <span className={r.passed ? 'px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700' : 'px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700'}>
                      {r.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}