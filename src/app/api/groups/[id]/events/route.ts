import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params

  const events = await db.groupEvent.findMany({
    where: { groupId, scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: 'asc' },
    take: 20,
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  return NextResponse.json({ events })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id: groupId } = await params
  const { title, description, scheduledAt } = await req.json()

  if (!title?.trim() || !scheduledAt) {
    return NextResponse.json({ error: 'Título y fecha son requeridos' }, { status: 400 })
  }

  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!membership) return NextResponse.json({ error: 'No eres miembro' }, { status: 403 })

  const event = await db.groupEvent.create({
    data: {
      groupId,
      userId:      session.user.id,
      title:       title.trim(),
      description: description?.trim() || null,
      scheduledAt: new Date(scheduledAt),
    },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  return NextResponse.json({ event }, { status: 201 })
}
