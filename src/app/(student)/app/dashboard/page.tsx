'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { FileText, CheckCircle, TrendingUp, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const { data: session } = useSession()
  const [results, setResults] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])

  // Fetch exams immediately — no auth needed
  useEffect(() => {
    fetch('/api/exams').then(r => r.json()).then(d => setExams(d.slice(0, 4))).catch(() => {})
  }, [])

  // Fetch results once we have userId
  useEffect(() => {
    const userId = (session?.user as any)?.id
    if (!userId) return
    fetch(`/api/results?userId=${userId}`).then(r => r.json()).then(setResults).catch(() => {})
  }, [(session?.user as any)?.id])

  const totalAttempts = results.length
  const passed = results.filter(r => r.passed).length
  const avgScore = totalAttempts > 0
    ? Math.round(results.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / totalAttempts)
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome back, {session?.user?.name ?? '...'} 👋
      </h1>
      <p className="text-gray-500 mb-8">Ready to practice today?</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Exams Taken', value: totalAttempts, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Passed', value: passed, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
          { label: 'Available', value: exams.length, icon: BookOpen, color: 'text-orange-600 bg-orange-50' },
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Available Exams</h2>
          <div className="space-y-3">
            {exams.length === 0 && <p className="text-sm text-gray-400">No exams available</p>}
            {exams.map((exam: any) => (
              <Link key={exam._id} href={`/app/exams/${exam._id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{exam.title}</p>
                  <p className="text-xs text-gray-500">{exam.subject?.name} · {exam.timeLimit} min</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{exam.type}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Results</h2>
          <div className="space-y-3">
            {results.length === 0 && <p className="text-sm text-gray-400">No results yet</p>}
            {results.slice(0, 5).map((r: any) => {
              const pct = Math.round((r.score / r.totalMarks) * 100)
              return (
                <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.exam?.title}</p>
                    <p className="text-xs text-gray-500">{r.score}/{r.totalMarks} correct</p>
                  </div>
                  <span className={`text-sm font-bold ${r.passed ? 'text-green-600' : 'text-red-500'}`}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
