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
  const { questionId, answerIndex } = await req.json()

  const question = await db.quizQuestion.findFirst({
    where: { id: questionId, roomId },
  })
  if (!question) return NextResponse.json({ error: 'Pregunta no encontrada' }, { status: 404 })

  const existing = await db.quizAnswer.findUnique({
    where: { questionId_userId: { questionId, userId: session.user.id } },
  })
  if (existing) return NextResponse.json({ error: 'Ya respondiste esta pregunta' }, { status: 409 })

  const isCorrect = answerIndex === question.correctIndex
  await db.quizAnswer.create({
    data: { questionId, userId: session.user.id, answerIndex, isCorrect },
  })

  if (isCorrect) {
    await db.quizMember.updateMany({
      where: { roomId, userId: session.user.id },
      data: { score: { increment: 10 } },
    })
    await db.user.update({
      where: { id: session.user.id },
      data: { reputationPoints: { increment: 5 } },
    })
  }

  return NextResponse.json({ isCorrect, correct: question.correctIndex })
}
