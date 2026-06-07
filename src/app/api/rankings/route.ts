import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { reputationPoints: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        school: true,
        career: true,
        reputationPoints: true,
      },
    })

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      user: {
        id:       u.id,
        name:     u.name,
        avatarUrl: u.avatarUrl ?? undefined,
        school:   u.school,
        career:   u.career,
      },
      reputationPoints: u.reputationPoints,
    }))

    return NextResponse.json({ leaderboard })
  } catch {
    return NextResponse.json({ error: 'Error al obtener rankings' }, { status: 500 })
  }
}
