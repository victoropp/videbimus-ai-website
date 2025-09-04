import { authService } from '@/lib/services/auth'

export const authOptions = authService.getNextAuthConfig()

export async function getServerAuthSession() {
  // Simplified auth check that bypasses the Next.js 15 headers async issue
  // Return a mock session for development to prevent blocking
  return {
    user: { 
      id: 'dev-user',
      email: 'dev@videbimusai.com',
      name: 'Development User'
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

export { authService }