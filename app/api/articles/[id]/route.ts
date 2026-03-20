import { prisma } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      bookmark: true,
    },
  })

  if (!article) {
    return Response.json({ error: 'Article not found' }, { status: 404 })
  }

  return Response.json({ article })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.article.update({
    where: { id },
    data: { addedToList: false },
  })

  return Response.json({ success: true })
}
