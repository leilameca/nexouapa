import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      school: true,
      career: true,
      bio: true,
      avatarUrl: true,
      githubUrl: true,
      linkedinUrl: true,
      reputationPoints: true,
      createdAt: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ user })
}
