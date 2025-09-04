import NextAuth from 'next-auth'
import { authService } from '@/lib/services/auth'

export const { auth, handlers, signIn, signOut } = NextAuth(authService.getNextAuthConfig())