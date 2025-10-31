import { initTRPC, TRPCError } from "@trpc/server"
import { type Context } from "./context"
import superjson from "superjson"
import { ZodError } from "zod"
import { UserRole } from "@prisma/client"

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const createCaller = createCallerFactory
export const publicProcedure = t.procedure

// Middleware for authenticated users
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

// Middleware for admin users only
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  if (ctx.session.user.role !== UserRole.ADMIN) {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

// Middleware for consultants and admins
const enforceUserIsConsultant = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  if (![UserRole.ADMIN, UserRole.CONSULTANT].includes(ctx.session.user.role as any)) {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
export const adminProcedure = t.procedure.use(enforceUserIsAdmin)
export const consultantProcedure = t.procedure.use(enforceUserIsConsultant)