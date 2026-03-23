'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ExamRunner } from '@/components/student/exam-runner'
import { usePaymentGuard } from '@/hooks/usePaymentGuard'

export default function TakeExamPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const { checked } = usePaymentGuard()
  const [exam, setExam] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id || !checked) return
    fetch(`/api/exams/${id}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null } return r.json() })
      .then(d => { if (d) setExam(d) })
  }, [id])

  if (!checked) return <div className="text-center py-16 text-gray-400">Checking access...</div>
  if (notFound) return <div className="text-center py-16 text-gray-400">Exam not found.</div>
  if (!exam || !session) return <div className="text-center py-16 text-gray-400">Loading...</div>

  const userId = (session.user as any).id

  return (
    <ExamRunner
      exam={{
        id: exam._id,
        title: exam.title,
        timeLimit: exam.timeLimit,
        passingMark: exam.passingMark,
        type: exam.type,
        subject: exam.subject?.name ?? '',
      }}
      questions={exam.questions.map((q: any) => ({
        id: q._id,
        question: q.question,
        type: q.type,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanationA: q.explanationA,
        explanationB: q.explanationB,
        explanationC: q.explanationC,
        explanationD: q.explanationD,
      }))}
      userId={userId}
    />
  )
}
