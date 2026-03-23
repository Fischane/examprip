import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from './mongoose'
import { User } from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await connectDB()
        const user = await User.findOne({ email: credentials.email.toLowerCase() })
        if (!user) { console.log('[auth] user not found:', credentials.email); return null }
        if (!user.isActive) { console.log('[auth] user inactive'); return null }
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) { console.log('[auth] wrong password for:', credentials.email); return null }
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isPaid: user.isPaid ?? false,
          paidUntil: user.paidUntil ? user.paidUntil.toISOString() : null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.isPaid = (user as any).isPaid
        token.paidUntil = (user as any).paidUntil
      }
      // Re-fetch isPaid on session update (e.g. after admin approves payment)
      if (trigger === 'update') {
        await connectDB()
        const fresh = await User.findById(token.id).select('isPaid paidUntil').lean() as any
        if (fresh) {
          token.isPaid = fresh.isPaid ?? false
          token.paidUntil = fresh.paidUntil ? fresh.paidUntil.toISOString() : null
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).isPaid = token.isPaid
        ;(session.user as any).paidUntil = token.paidUntil
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'secret-key-change-in-production',
}
