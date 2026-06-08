import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const { name, bio, githubUrl, linkedinUrl, avatarUrl } = await req.json()

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(name        ? { name }        : {}),
        ...(bio         !== undefined ? { bio }         : {}),
        ...(githubUrl   !== undefined ? { githubUrl }   : {}),
        ...(linkedinUrl !== undefined ? { linkedinUrl } : {}),
        ...(avatarUrl   !== undefined ? { avatarUrl }   : {}),
      },
      select: { id: true, name: true, bio: true, githubUrl: true, linkedinUrl: true, avatarUrl: true },
    })

    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, school: true, career: true,
      bio: true, avatarUrl: true, githubUrl: true, linkedinUrl: true,
      reputationPoints: true,
    },
  })

  return NextResponse.json({ user })
}
