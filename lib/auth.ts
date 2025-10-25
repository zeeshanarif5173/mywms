import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Real authentication with specific credentials
        const users = [
          {
            email: 'customer@example.com',
            password: 'customer123',
            id: '1',
            name: 'John Customer',
            role: 'CUSTOMER',
            branchId: '1' // Downtown Branch
          },
          {
            email: 'manager@example.com',
            password: 'manager123',
            id: '2',
            name: 'Jane Manager',
            role: 'MANAGER',
            branchId: '1' // Downtown Branch
          },
          {
            email: 'admin@example.com',
            password: 'admin123',
            id: '3',
            name: 'Admin User',
            role: 'ADMIN',
            branchId: '1' // Downtown Branch (admin can access all)
          },
          {
            email: 'staff@example.com',
            password: 'staff123',
            id: '4',
            name: 'Staff User',
            role: 'STAFF',
            branchId: '1' // Downtown Branch
          }
        ]

        const user = users.find(u =>
          u.email === credentials.email && u.password === credentials.password
        )

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            branchId: user.branchId,
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.role = user.role
        token.branchId = user.branchId
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.branchId = token.branchId
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
