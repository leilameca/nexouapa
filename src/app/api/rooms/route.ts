import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const rooms = await db.pomodoroRoom.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { participants: true } },
      },
    })

    const shaped = rooms.map((r) => ({
      id:               r.id,
      name:             r.name,
      school:           r.school,
      subjectTag:       r.subjectTag,
      timerSeconds:     r.timerSeconds,
      isBreak:          r.isBreak,
      cycleStart:       r.cycleStart.toISOString(),
      participantCount: r._count.participants,
    }))

    return NextResponse.json({ rooms: shaped })
  } catch {
    return NextResponse.json({ error: 'Error al obtener salas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const { name, school, subjectTag } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const room = await db.pomodoroRoom.create({
      data: {
        name:       name.trim(),
        school:     school  ?? null,
        subjectTag: subjectTag ?? null,
        timerSeconds: 1500,
        isBreak:    false,
        cycleStart: new Date(),
      },
      include: {
        _count: { select: { participants: true } },
      },
    })

    // Auto-join the creator
    await db.roomParticipant.create({
      data: { userId: session.user.id, roomId: room.id },
    })

    return NextResponse.json({
      id:               room.id,
      name:             room.name,
      school:           room.school,
      subjectTag:       room.subjectTag,
      timerSeconds:     room.timerSeconds,
      isBreak:          room.isBreak,
      cycleStart:       room.cycleStart.toISOString(),
      participantCount: 1,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear sala' }, { status: 500 })
  }
}
