import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id: groupId } = await params
  const group = await db.group.findUnique({ where: { id: groupId }, select: { id: true } })
  if (!group) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })

  const existing = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })

  if (existing) {
    await db.groupMember.delete({ where: { id: existing.id } })
    return NextResponse.json({ joined: false })
  } else {
    await db.groupMember.create({ data: { groupId, userId: session.user.id, role: 'member' } })
    return NextResponse.json({ joined: true })
  }
}
