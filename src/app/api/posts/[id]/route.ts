import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params

  const post = await db.post.findUnique({ where: { id }, select: { userId: true } })
  if (!post) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (post.userId !== session.user.id) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  await db.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
