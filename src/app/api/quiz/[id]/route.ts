import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const room = await db.quizRoom.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, name: true, avatarUrl: true } },
      questions: { orderBy: { orderIndex: 'asc' } },
      members: {
        orderBy: { score: 'desc' },
        include: { user: { select: { id: true, name: true, avatarUrl: true, career: true } } },
      },
    },
  })

  if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })

  return NextResponse.json({ room })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { id } = await params
  const room = await db.quizRoom.findUnique({ where: { id }, select: { hostId: true } })
  if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  if (room.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Solo el creador puede modificar la sala' }, { status: 403 })
  }

  const { isActive } = await req.json()
  const updated = await db.quizRoom.update({ where: { id }, data: { isActive } })
  return NextResponse.json({ room: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { id } = await params
  const room = await db.quizRoom.findUnique({ where: { id }, select: { hostId: true } })
  if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  if (room.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Solo el creador puede eliminar la sala' }, { status: 403 })
  }

  await db.quizRoom.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
