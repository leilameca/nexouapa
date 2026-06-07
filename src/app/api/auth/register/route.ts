import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, school, career } = await req.json()

    if (!name || !email || !password || !school || !career) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }
    if (!email.endsWith('@uapa.edu.do') && !email.endsWith('@p.uapa.edu.do')) {
      return NextResponse.json({ error: 'Correo debe ser @uapa.edu.do o @p.uapa.edu.do' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Contraseña mínimo 8 caracteres' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await db.user.create({
      data: { name, email, passwordHash, school, career },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}
