import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const country = searchParams.get('country') ?? undefined
  const limit = 12

  const where = country ? { country } : {}

  const [posts, total] = await Promise.all([
    db.travelPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.travelPost.count({ where }),
  ])

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, location, country, imageUrl, content, authorName, tags } = body

  if (!title?.trim() || !location?.trim() || !country?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const post = await db.travelPost.create({
    data: {
      title: title.trim(),
      location: location.trim(),
      country: country.trim(),
      imageUrl: imageUrl?.trim() || null,
      content: content.trim(),
      authorName: authorName?.trim() || 'Anonymous Traveler',
      tags: Array.isArray(tags) ? tags : [],
    },
  })

  return NextResponse.json(post, { status: 201 })
}
