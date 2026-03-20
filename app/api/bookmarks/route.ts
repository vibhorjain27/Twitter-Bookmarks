import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const skip = (page - 1) * limit

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      skip,
      take: limit,
      orderBy: { bookmarkedAt: 'desc' },
      include: {
        article: {
          select: { id: true, addedToList: true, title: true },
        },
      },
    }),
    prisma.bookmark.count(),
  ])

  return Response.json({
    bookmarks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
