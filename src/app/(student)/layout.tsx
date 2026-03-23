'use client'

import { usePathname } from 'next/navigation'
import { StudentNav } from '@/components/student/nav'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isExam = pathname.includes('/app/exams/') && pathname.split('/').length > 4

  if (isExam) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav />
      <main>{children}</main>
    </div>
  )
}
