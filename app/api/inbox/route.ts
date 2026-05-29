import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const STATUS_ORDER: Record<string, number> = { todo: 0, inprogress: 1, done: 2 }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cat = searchParams.get('cat')

    const items = await prisma.inboxItem.findMany({
      where: cat && cat !== 'all' ? { cat } : undefined,
      orderBy: { added: 'desc' },
    })

    type Row = { status: string; added: Date }
    ;(items as Row[]).sort((a, b) => {
      const sd = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
      if (sd !== 0) return sd
      return b.added.getTime() - a.added.getTime()
    })

    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, url, cat } = body
    if (!title || !cat) {
      return NextResponse.json({ error: 'title and cat are required' }, { status: 400 })
    }
    const item = await prisma.inboxItem.create({
      data: { title: title.trim(), url: url?.trim() || null, cat, status: 'todo' },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
