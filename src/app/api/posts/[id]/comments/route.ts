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

  const post = await db.post.findUnique({ where: { id: postId }, select: { id: true, userId: true } })
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  const comment = await db.comment.create({
    data: {
      userId:          session.user.id,
      postId,
      commentText:     text.trim(),
      parentCommentId: parentCommentId ?? null,
    },
    include: {
      user:    { select: { id: true, name: true, avatarUrl: true, career: true } },
      replies: { include: { user: { select: { id: true, name: true, avatarUrl: true, career: true } } } },
    },
  })

  await db.user.update({
    where: { id: session.user.id },
    data:  { reputationPoints: { increment: 1 } },
  })

  const notifPromises: Promise<unknown>[] = []

  // Notify post author of comment (if not self)
  if (post.userId !== session.user.id) {
    notifPromises.push(
      db.notification.create({
        data: {
          userId:     post.userId,
          type:       'comment',
          fromUserId: session.user.id,
          postId,
          message:    `${session.user.name} comentó tu publicación`,
        },
      }),
    )
  }

  // Notify parent comment author of reply (if not self)
  if (parentCommentId) {
    const parent = await db.comment.findUnique({ where: { id: parentCommentId }, select: { id: true, userId: true } })
    if (parent && parent.userId !== session.user.id) {
      notifPromises.push(
        db.notification.create({
          data: {
            userId:     parent.userId,
            type:       'reply',
            fromUserId: session.user.id,
            postId,
            message:    `${session.user.name} respondió tu comentario`,
          },
        }),
      )
    }
  }

  // Parse @mentions and notify
  const mentions = [...text.matchAll(/@(\S+)/g)].map((m) => m[1])
  if (mentions.length > 0) {
    const mentioned = await db.user.findMany({
      where: { name: { in: mentions } },
      select: { id: true },
    })
    for (const u of mentioned) {
      if (u.id !== session.user.id) {
        notifPromises.push(
          db.notification.create({
            data: {
              userId:     u.id,
              type:       'mention',
              fromUserId: session.user.id,
              postId,
              message:    `${session.user.name} te mencionó en un comentario`,
            },
          }),
        )
      }
    }
  }

  await Promise.allSettled(notifPromises)

  return NextResponse.json({ comment }, { status: 201 })
}
