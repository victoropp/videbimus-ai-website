import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a lazy Prisma client that only initializes when needed
let _prisma: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    // Initialize client only when needed and not during build
    if (!_prisma && typeof window === 'undefined' && !process.env.NEXT_PHASE) {
      _prisma = globalForPrisma.prisma ?? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
      if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _prisma;
    }
    
    if (!_prisma) {
      // Return a no-op function for any method call during build time
      return () => Promise.resolve(null);
    }
    
    return _prisma[prop as keyof PrismaClient];
  }
});