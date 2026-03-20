import { prisma } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { bookmark: true },
    })

    if (!article) {
      return Response.json({ error: 'Article not found' }, { status: 404 })
    }

    return Response.json({ article })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await prisma.article.update({
      where: { id },
      data: { addedToList: false },
    })
    return Response.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return Response.json({ error: message }, { status: 500 })
  }
}
