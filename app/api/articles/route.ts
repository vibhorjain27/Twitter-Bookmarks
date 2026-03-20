import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const skip = (page - 1) * limit

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { addedToList: true },
      skip,
      take: limit,
      orderBy: { addedAt: 'desc' },
      include: {
        bookmark: {
          select: { tweetText: true, authorUsername: true, authorName: true },
        },
      },
    }),
    prisma.article.count({ where: { addedToList: true } }),
  ])

  return Response.json({
    articles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: Request) {
  try {
    const { bookmarkId, url } = await request.json()

    if (!bookmarkId || !url) {
      return Response.json({ error: 'bookmarkId and url are required' }, { status: 400 })
    }

    // Check if article already exists
    const existing = await prisma.article.findUnique({ where: { bookmarkId } })

    if (existing) {
      // If it exists but was removed, re-add it
      const updated = await prisma.article.update({
        where: { bookmarkId },
        data: { addedToList: true, addedAt: new Date() },
      })
      return Response.json({ article: updated, wasRestored: true })
    }

    const article = await prisma.article.create({
      data: {
        bookmarkId,
        url,
        addedToList: true,
      },
    })

    return Response.json({ article }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
