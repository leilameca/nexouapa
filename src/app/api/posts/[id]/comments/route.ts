import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params

  const comments = await db.comment.findMany({
    where: { postId, parentCommentId: null },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, career: true } },
      replies: {
        include: { user: { select: { id: true, name: true, avatarUrl: true, career: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  return NextResponse.json({ comments })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { id: postId } = await params
  const { text, parentCommentId } = await req.json()

  if (!text?.trim()) {
    return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 })
  }

  const post = await db.post.findUnique({ where: { id: postId }, select: { id: true } })
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  const comment = await db.comment.create({
    data: {
      userId:          session.user.id,
      postId,
      commentText:     text.trim(),
      parentCommentId: parentCommentId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, career: true } },
    },
  })

  // Award reputation for helpful answer (+2 per comment as activity bonus)
  await db.user.update({
    where: { id: session.user.id },
    data:  { reputationPoints: { increment: 1 } },
  })

  return NextResponse.json({ comment }, { status: 201 })
}
