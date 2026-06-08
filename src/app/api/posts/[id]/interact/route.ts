import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const REPUTATION: Record<string, number> = {
  like:   2,
  upvote: 10,
  repost: 0,
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
  const { type } = await req.json()

  if (!['like', 'upvote', 'repost'].includes(type)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const post = await db.post.findUnique({
    where: { id: postId },
    select: { userId: true, postType: true },
  })
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  if (type === 'upvote' && post.postType === 'general') {
    return NextResponse.json({ error: 'Solo se puede votar preguntas y proyectos' }, { status: 400 })
  }

  const existing = await db.interaction.findUnique({
    where: {
      userId_postId_interactionType: {
        userId: session.user.id,
        postId,
        interactionType: type,
      },
    },
  })

  if (existing) {
    await db.interaction.delete({ where: { id: existing.id } })
    if (REPUTATION[type] > 0 && post.userId !== session.user.id) {
      await db.user.update({
        where: { id: post.userId },
        data: { reputationPoints: { decrement: REPUTATION[type] } },
      })
    }
    return NextResponse.json({ active: false })
  } else {
    await db.interaction.create({
      data: { userId: session.user.id, postId, interactionType: type },
    })
    if (REPUTATION[type] > 0 && post.userId !== session.user.id) {
      await Promise.all([
        db.user.update({
          where: { id: post.userId },
          data: { reputationPoints: { increment: REPUTATION[type] } },
        }),
        db.notification.create({
          data: {
            userId:     post.userId,
            type,
            fromUserId: session.user.id,
            postId,
            message:    type === 'like'
              ? `${session.user.name} le dio like a tu publicación`
              : `${session.user.name} votó tu publicación`,
          },
        }),
      ])
    }
    return NextResponse.json({ active: true })
  }
}
