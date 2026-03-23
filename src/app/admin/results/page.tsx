'use client'

import { useEffect, useState } from 'react'

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])

  useEffect(() => { fetch('/api/results').then(r => r.json()).then(setResults) }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Results</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Student', 'Exam', 'Score', '%', 'Status', 'Time', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((r: any) => {
              const pct = Math.round((r.score / r.totalMarks) * 100)
              const mins = Math.floor(r.timeTaken / 60)
              return (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.user?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.exam?.title}</td>
                  <td className="px-4 py-3">{r.score}/{r.totalMarks}</td>
                  <td className="px-4 py-3 font-semibold">{pct}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{mins}m</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              )
            })}
            {results.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No results yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
