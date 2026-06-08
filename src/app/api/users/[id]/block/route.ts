import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ isBlocked: false })

  const { id: targetId } = await params
  const block = await db.userBlock.findUnique({
    where: { blockerId_blockedId: { blockerId: session.user.id, blockedId: targetId } },
  })
  return NextResponse.json({ isBlocked: !!block })
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id: targetId } = await params
  if (targetId === session.user.id) return NextResponse.json({ error: 'No puedes bloquearte a ti mismo' }, { status: 400 })

  const existing = await db.userBlock.findUnique({
    where: { blockerId_blockedId: { blockerId: session.user.id, blockedId: targetId } },
  })

  if (existing) {
    await db.userBlock.delete({ where: { id: existing.id } })
    return NextResponse.json({ blocked: false })
  } else {
    await db.userBlock.create({ data: { blockerId: session.user.id, blockedId: targetId } })
    return NextResponse.json({ blocked: true })
  }
}
