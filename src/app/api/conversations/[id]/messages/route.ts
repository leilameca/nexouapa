import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id: conversationId } = await params

  // Verify participation
  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  })
  if (!participant) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  })

  // Mark messages from others as read
  await db.message.updateMany({
    where: { conversationId, senderId: { not: session.user.id }, isRead: false },
    data: { isRead: true },
  })
  // Update lastReadAt
  await db.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
    data: { lastReadAt: new Date() },
  })

  return NextResponse.json({ messages })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id: conversationId } = await params
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })

  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  })
  if (!participant) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const message = await db.message.create({
    data: { conversationId, senderId: session.user.id, text: text.trim() },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  })

  // Notify the other participant
  const other = await db.conversationParticipant.findFirst({
    where: { conversationId, userId: { not: session.user.id } },
  })
  if (other) {
    await db.notification.create({
      data: {
        userId:     other.userId,
        type:       'message',
        fromUserId: session.user.id,
        message:    `${session.user.name} te envió un mensaje`,
      },
    }).catch(() => {/* non-critical */})
  }

  return NextResponse.json({ message }, { status: 201 })
}
