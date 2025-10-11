import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      branchId: string
    }
  }

  interface User {
    role: string
    branchId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    branchId: string
  }
}
