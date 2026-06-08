import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { id: roomId } = await params
  const room = await db.quizRoom.findUnique({ where: { id: roomId }, select: { hostId: true } })
  if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  if (room.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Solo el creador puede agregar preguntas' }, { status: 403 })
  }

  const { question, options, correctIndex } = await req.json()
  if (!question?.trim() || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: 'Datos de pregunta inválidos' }, { status: 400 })
  }
  if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex >= options.length) {
    return NextResponse.json({ error: 'Índice correcto inválido' }, { status: 400 })
  }

  const count = await db.quizQuestion.count({ where: { roomId } })

  const q = await db.quizQuestion.create({
    data: {
      roomId,
      question:     question.trim(),
      options:      JSON.stringify(options.map((o: string) => o.trim())),
      correctIndex,
      orderIndex:   count,
    },
  })

  return NextResponse.json({ question: q }, { status: 201 })
}
