import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const notes = await db.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, subject: true, content: true, isPublic: true, createdAt: true, updatedAt: true },
  })

  return NextResponse.json({ notes })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { title, content, subject, isPublic } = await req.json()

  if (!title?.trim() || !content?.trim() || !subject?.trim()) {
    return NextResponse.json({ error: 'Título, contenido y asignatura son requeridos' }, { status: 400 })
  }

  const note = await db.note.create({
    data: {
      userId:   session.user.id,
      title:    title.trim(),
      content:  content.trim(),
      subject:  subject.trim(),
      isPublic: isPublic ?? false,
    },
  })

  return NextResponse.json({ note }, { status: 201 })
}
