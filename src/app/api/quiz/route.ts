import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest) {
  const rooms = await db.quizRoom.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      host: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { members: true, questions: true } },
    },
  })

  return NextResponse.json({ rooms })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { name, subject } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
  }

  const room = await db.quizRoom.create({
    data: {
      hostId:  session.user.id,
      name:    name.trim(),
      subject: subject?.trim() || null,
    },
    include: {
      host: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { members: true, questions: true } },
    },
  })

  // Host auto-joins
  await db.quizMember.create({ data: { roomId: room.id, userId: session.user.id } })

  return NextResponse.json({ room }, { status: 201 })
}
