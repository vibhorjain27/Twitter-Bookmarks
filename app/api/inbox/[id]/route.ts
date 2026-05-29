import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const NEXT_STATUS: Record<string, string> = {
  todo: 'inprogress',
  inprogress: 'done',
  done: 'done',
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    let newStatus: string
    if (body.status) {
      newStatus = body.status
    } else {
      const current = await prisma.inboxItem.findUnique({
        where: { id },
        select: { status: true },
      })
      if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      newStatus = NEXT_STATUS[current.status] ?? 'done'
    }

    const item = await prisma.inboxItem.update({
      where: { id },
      data: { status: newStatus },
    })
    return NextResponse.json({ item })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.inboxItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
