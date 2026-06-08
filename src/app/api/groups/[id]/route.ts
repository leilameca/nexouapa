import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  const { id } = await params

  const group = await db.group.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        orderBy: { joinedAt: 'asc' },
        include: { user: { select: { id: true, name: true, avatarUrl: true, career: true, school: true, reputationPoints: true } } },
      },
      _count: { select: { members: true, posts: true, events: true } },
    },
  })

  if (!group) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })

  const isMember = session?.user?.id
    ? group.members.some((m) => m.userId === session.user!.id)
    : false

  return NextResponse.json({ group: { ...group, isMember } })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const group = await db.group.findUnique({ where: { id }, select: { createdBy: true } })
  if (!group) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })
  if (group.createdBy !== session.user.id) return NextResponse.json({ error: 'Solo el creador puede eliminar el grupo' }, { status: 403 })

  await db.group.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
