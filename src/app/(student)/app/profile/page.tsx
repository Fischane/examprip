'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const userId = (session?.user as any)?.id
    if (!userId) return
    fetch(`/api/results?userId=${userId}`).then(r => r.json()).then(setResults)
  }, [session])

  const user = session?.user as any
  const totalAttempts = results.length
  const passed = results.filter(r => r.passed).length
  const avgScore = totalAttempts > 0
    ? Math.round(results.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / totalAttempts)
    : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Exams Taken', value: totalAttempts },
            { label: 'Passed', value: passed },
            { label: 'Avg Score', value: `${avgScore}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
