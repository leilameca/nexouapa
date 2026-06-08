import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { id: roomId } = await params
  const room = await db.quizRoom.findUnique({ where: { id: roomId }, select: { id: true } })
  if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })

  await db.quizMember.upsert({
    where: { roomId_userId: { roomId, userId: session.user.id } },
    create: { roomId, userId: session.user.id },
    update: {},
  })

  return NextResponse.json({ ok: true })
}
