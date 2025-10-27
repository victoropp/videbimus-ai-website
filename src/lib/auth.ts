import { authService } from '@/lib/services/auth'
import { auth } from '@/auth'

export const authOptions = authService.getNextAuthConfig()

/**
 * Gets the authenticated user session from NextAuth
 * Returns null if user is not authenticated
 */
export async function getServerAuthSession() {
  try {
    const session = await auth()

    // Return null if no session exists (user not authenticated)
    if (!session || !session.user) {
      return null
    }

    return session
  } catch (error) {
    console.error('Failed to get server auth session:', error)
    // Return null on error to deny access
    return null
  }
}

export { authService }