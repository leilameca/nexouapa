import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id

  const groups = await db.group.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      _count:  { select: { members: true, posts: true } },
      members: userId ? { where: { userId }, select: { id: true } } : false,
    },
  })

  return NextResponse.json({
    groups: groups.map((g) => ({
      ...g,
      isMember: userId ? (g.members as { id: string }[]).length > 0 : false,
      members: undefined,
    })),
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { name, subject, description } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })

  const group = await db.group.create({
    data: {
      name:        name.trim(),
      subject:     subject?.trim() || null,
      description: description?.trim() || null,
      createdBy:   session.user.id,
      members:     { create: { userId: session.user.id, role: 'admin' } },
    },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      _count:  { select: { members: true, posts: true } },
    },
  })

  return NextResponse.json({ group: { ...group, isMember: true } }, { status: 201 })
}
