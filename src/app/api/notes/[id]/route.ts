import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const { title, content, subject, isPublic } = await req.json()

  const existing = await db.note.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  const note = await db.note.update({
    where: { id },
    data: {
      ...(title   ? { title:   title.trim()   } : {}),
      ...(content ? { content: content.trim() } : {}),
      ...(subject ? { subject: subject.trim() } : {}),
      ...(isPublic !== undefined ? { isPublic } : {}),
    },
  })

  return NextResponse.json({ note })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params

  const existing = await db.note.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  await db.note.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
