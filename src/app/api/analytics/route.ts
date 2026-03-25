export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { connectDB } from '@/lib/mongoose'
import { User } from '@/models/User'
import { Exam } from '@/models/Exam'
import { Result } from '@/models/Result'

export async function GET() {
  noStore()
  await connectDB()

  const [totalUsers, totalExams, agg] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Exam.countDocuments(),
    Result.aggregate([
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          totalPassed: { $sum: { $cond: ['$passed', 1, 0] } },
          totalPct: {
            $sum: {
              $multiply: [{ $divide: ['$score', '$totalMarks'] }, 100],
            },
          },
        },
      },
    ]),
  ])

  const stats = agg[0] ?? { totalAttempts: 0, totalPassed: 0, totalPct: 0 }
  const avgScore = stats.totalAttempts > 0 ? Math.round(stats.totalPct / stats.totalAttempts) : 0
  const passRate = stats.totalAttempts > 0 ? Math.round((stats.totalPassed / stats.totalAttempts) * 100) : 0

  return NextResponse.json({
    totalUsers,
    totalExams,
    totalAttempts: stats.totalAttempts,
    avgScore,
    passRate,
  })
}
