import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? 'nexo-uapa-dev-secret-change-in-prod',
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        )
        if (!valid) return null

        return {
          id:     user.id,
          name:   user.name,
          email:  user.email,
          school: user.school,
          career: user.career,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id     = user.id
        token.school = (user as { school?: string }).school
        token.career = (user as { career?: string }).career
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id     = token.id as string
        session.user.school = token.school as string
        session.user.career = token.career as string
      }
      return session
    },
  },
})
