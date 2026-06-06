import 'next-auth'

declare module 'next-auth' {
  interface User {
    school?: string
    career?: string
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      school: string
      career: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    school?: string
    career?: string
  }
}
