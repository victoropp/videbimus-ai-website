import { type CreateNextContextOptions } from "@trpc/server/adapters/next"
import { type Session } from "next-auth"
import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import { prisma } from "@/lib/prisma"

type CreateContextOptions = {
  session: Session | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  }
}

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerSession(req, res, authConfig)

  return createInnerTRPCContext({
    session,
  })
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>