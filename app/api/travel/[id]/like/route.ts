import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const post = await db.travelPost.update({
    where: { id },
    data: { likes: { increment: 1 } },
  })
  return NextResponse.json({ likes: post.likes })
}
