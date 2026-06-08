import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET: list conversations for current user
export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const participations = await db.conversationParticipant.findMany({
    where: { userId: session.user.id },
    orderBy: { conversation: { messages: { _count: 'desc' } } },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, avatarUrl: true, career: true } } },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  const conversations = participations.map((p) => {
    const other = p.conversation.participants.find((cp) => cp.userId !== session.user!.id)
    const lastMsg = p.conversation.messages[0] ?? null
    const unread = 0 // simplified: would need a count query per conversation
    return {
      id:         p.conversation.id,
      otherUser:  other?.user ?? null,
      lastMsg:    lastMsg ? { text: lastMsg.text, createdAt: lastMsg.createdAt, isRead: lastMsg.isRead, senderId: lastMsg.senderId } : null,
      unread,
      createdAt:  p.conversation.createdAt,
    }
  })

  return NextResponse.json({ conversations })
}

// POST: open/get a DM conversation with another user
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { userId: targetId } = await req.json()
  if (!targetId || targetId === session.user.id) {
    return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 })
  }

  // Check block
  const blocked = await db.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: targetId },
        { blockerId: targetId, blockedId: session.user.id },
      ],
    },
  })
  if (blocked) return NextResponse.json({ error: 'No puedes enviar mensajes a este usuario' }, { status: 403 })

  // Find existing conversation between both users
  const existing = await db.conversation.findFirst({
    where: {
      participants: {
        every: { userId: { in: [session.user.id, targetId] } },
      },
      AND: {
        participants: { some: { userId: session.user.id } },
      },
    },
    include: { participants: true },
  })

  if (existing && existing.participants.length === 2) {
    return NextResponse.json({ conversationId: existing.id })
  }

  // Create new conversation
  const conv = await db.conversation.create({
    data: {
      participants: {
        create: [
          { userId: session.user.id },
          { userId: targetId },
        ],
      },
    },
  })

  return NextResponse.json({ conversationId: conv.id }, { status: 201 })
}
