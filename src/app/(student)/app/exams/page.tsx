'use client'

import { useEffect, useState } from 'react'
import { Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clearPaymentCache } from '@/hooks/usePaymentGuard'

export default function ExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch payment status and exams in parallel
    Promise.all([
      fetch('/api/payments/status').then(r => r.json()),
      fetch('/api/exams').then(r => r.json()),
    ]).then(([status, data]) => {
      if (!status.isPaid) {
        clearPaymentCache()
        router.replace('/app/payment')
        return
      }
      setExams(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Exams</h1>
      {exams.length === 0 && <div className="text-center py-16 text-gray-400">No exams available yet.</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((exam: any) => (
          <div key={exam._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                exam.type === 'MOCK' ? 'bg-purple-100 text-purple-700' :
                exam.type === 'PRACTICE' ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              }`}>{exam.type}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{exam.subject?.name}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.timeLimit} min</span>
              <span>{exam.questions?.length ?? 0} questions</span>
              <span>Pass: {exam.passingMark}%</span>
            </div>
            <Link href={`/app/exams/${exam._id}`}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Start Exam
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
