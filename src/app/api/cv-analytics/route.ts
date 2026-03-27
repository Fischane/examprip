export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import { CVDocument } from '@/models/CVDocument'
import { DownloadRecord } from '@/models/DownloadRecord'
import { CVPayment } from '@/models/CVPayment'
import { CVTemplate } from '@/models/CVTemplate'

export async function GET() {
  noStore()
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)

    const [totalCVs, totalDownloads, activeUsersAgg, topTemplatesAgg, topPaidAgg] = await Promise.all([
      CVDocument.countDocuments({ createdAt: { $gte: monthStart } }),
      DownloadRecord.countDocuments({ createdAt: { $gte: monthStart } }),
      CVDocument.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: '$user' } },
        { $count: 'count' },
      ]),
      CVDocument.aggregate([
        { $group: { _id: '$templateId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'cvtemplates', localField: '_id', foreignField: '_id', as: 'tpl' } },
        { $addFields: { name: { $arrayElemAt: ['$tpl.name', 0] } } },
        { $project: { tpl: 0 } },
      ]),
      CVPayment.aggregate([
        { $match: { status: 'approved' } },
        { $lookup: { from: 'cvtemplates', localField: 'template', foreignField: '_id', as: 'tpl' } },
        { $addFields: { price: { $arrayElemAt: ['$tpl.price', 0] }, name: { $arrayElemAt: ['$tpl.name', 0] } } },
        { $group: { _id: '$template', name: { $first: '$name' }, revenue: { $sum: '$price' } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
    ])

    return NextResponse.json({
      totalCVs,
      totalDownloads,
      activeUsers: activeUsersAgg[0]?.count ?? 0,
      topTemplates: topTemplatesAgg,
      topPaidTemplates: topPaidAgg,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
