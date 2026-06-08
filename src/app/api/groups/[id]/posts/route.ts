import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params

  const posts = await db.groupPost.findMany({
    where: { groupId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { id: true, name: true, avatarUrl: true, career: true } } },
  })

  return NextResponse.json({ posts })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id: groupId } = await params
  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'El contenido no puede estar vacío' }, { status: 400 })

  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!membership) return NextResponse.json({ error: 'No eres miembro de este grupo' }, { status: 403 })

  const post = await db.groupPost.create({
    data: { groupId, userId: session.user.id, content: content.trim() },
    include: { user: { select: { id: true, name: true, avatarUrl: true, career: true } } },
  })

  // Notify members (up to 20) about new post
  const members = await db.groupMember.findMany({
    where: { groupId, userId: { not: session.user.id } },
    take: 20,
    select: { userId: true },
  })
  const group = await db.group.findUnique({ where: { id: groupId }, select: { name: true } })
  await Promise.allSettled(
    members.map((m) =>
      db.notification.create({
        data: {
          userId:     m.userId,
          type:       'group_post',
          fromUserId: session.user!.id,
          message:    `${session.user!.name} publicó en el grupo "${group?.name}"`,
        },
      }),
    ),
  )

  return NextResponse.json({ post }, { status: 201 })
}
