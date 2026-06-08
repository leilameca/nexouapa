import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  const { id: targetId } = await params

  const [followerCount, followingCount, isFollowing] = await Promise.all([
    db.follow.count({ where: { followingId: targetId } }),
    db.follow.count({ where: { followerId: targetId } }),
    session?.user?.id
      ? db.follow.findUnique({
          where: { followerId_followingId: { followerId: session.user.id, followingId: targetId } },
        })
      : null,
  ])

  return NextResponse.json({ followerCount, followingCount, isFollowing: !!isFollowing })
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { id: targetId } = await params
  if (targetId === session.user.id) {
    return NextResponse.json({ error: 'No puedes seguirte a ti mismo' }, { status: 400 })
  }

  const target = await db.user.findUnique({ where: { id: targetId }, select: { id: true } })
  if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const existing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetId } },
  })

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } })
    return NextResponse.json({ following: false })
  } else {
    await db.follow.create({ data: { followerId: session.user.id, followingId: targetId } })
    await db.notification.create({
      data: {
        userId:     targetId,
        type:       'follow',
        fromUserId: session.user.id,
        message:    `${session.user.name} comenzó a seguirte`,
      },
    })
    return NextResponse.json({ following: true })
  }
}
