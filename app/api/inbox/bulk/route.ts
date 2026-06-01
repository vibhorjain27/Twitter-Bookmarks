import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface ItemInput {
  title: string
  url?: string
  cat: string
  sourceId?: string
  added?: string
}

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json() as { items: ItemInput[] }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const sourceIds = items.map(i => i.sourceId).filter(Boolean) as string[]
    const existing = await prisma.inboxItem.findMany({
      where: { sourceId: { in: sourceIds } },
      select: { sourceId: true },
    })
    const existingSet = new Set(existing.map(e => e.sourceId))

    const toInsert = items.filter(i => !existingSet.has(i.sourceId))

    if (toInsert.length > 0) {
      await prisma.inboxItem.createMany({
        data: toInsert.map(i => ({
          title: i.title.slice(0, 300),
          url: i.url || null,
          cat: i.cat,
          status: 'todo',
          sourceId: i.sourceId || null,
          added: i.added ? new Date(i.added) : new Date(),
        })),
      })
    }

    return NextResponse.json({
      imported: toInsert.length,
      skipped: items.length - toInsert.length,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
