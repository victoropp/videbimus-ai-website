import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../init'
import { TRPCError } from '@trpc/server'

const teamMemberSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
  email: z.string().email().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  skills: z.array(z.string()).default([]),
  experience: z.number().min(0).max(50).optional(),
})

const updateTeamMemberSchema = teamMemberSchema.partial()

export const teamRouter = createTRPCRouter({
  // Public routes
  list: publicProcedure
    .input(z.object({
      isActive: z.boolean().default(true),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.findMany({
        where: {
          isActive: input.isActive,
        } as any,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        take: input.limit,
      })
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.teamMember.findUnique({
        where: { id: input.id },
      })

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team member not found',
        })
      }

      return member
    }),

  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.findUnique({
        where: { email: input.email },
      })
    }),

  // Admin routes
  create: adminProcedure
    .input(teamMemberSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if email is already in use
      if (input.email) {
        const existing = await ctx.prisma.teamMember.findUnique({
          where: { email: input.email },
        })

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already in use',
          })
        }
      }

      return ctx.prisma.teamMember.create({
        data: input as any,
      })
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      data: updateTeamMemberSchema as any,
    }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.teamMember.findUnique({
        where: { id: input.id },
      })

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team member not found',
        })
      }

      // Check if email is being changed and is already in use
      if (input.data.email && input.data.email !== member.email) {
        const existing = await ctx.prisma.teamMember.findUnique({
          where: { email: input.data.email },
        })

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already in use',
          })
        }
      }

      return ctx.prisma.teamMember.update({
        where: { id: input.id },
        data: input.data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.teamMember.findUnique({
        where: { id: input.id },
      })

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team member not found',
        })
      }

      return ctx.prisma.teamMember.delete({
        where: { id: input.id },
      })
    }),

  // Bulk operations
  reorder: adminProcedure
    .input(z.object({
      items: z.array(z.object({
        id: z.string(),
        sortOrder: z.number(),
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const updates = input.items.map(item =>
        ctx.prisma.teamMember.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )

      await ctx.prisma.$transaction(updates)
      return { success: true }
    }),

  toggleActive: adminProcedure
    .input(z.object({
      id: z.string(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })
    }),

  // Analytics and search
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      skills: z.array(z.string()).optional(),
      isActive: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        isActive: input.isActive,
        OR: [
          { name: { contains: input.query, mode: 'insensitive' } },
          { role: { contains: input.query, mode: 'insensitive' } },
          { bio: { contains: input.query, mode: 'insensitive' } },
        ],
      }

      if (input.skills && input.skills.length > 0) {
        whereClause.skills = {
          hasSome: input.skills,
        }
      }

      return ctx.prisma.teamMember.findMany({
        where: whereClause,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
      })
    }),

  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [total, active, inactive] = await Promise.all([
        ctx.prisma.teamMember.count(),
        ctx.prisma.teamMember.count({ where: { isActive: true } }),
        ctx.prisma.teamMember.count({ where: { isActive: false } }),
      ])

      // Get all unique skills
      const members = await ctx.prisma.teamMember.findMany({
        where: { isActive: true },
        select: { skills: true },
      })

      const allSkills = members.flatMap(member => member.skills)
      const skillCounts = allSkills.reduce((acc: Record<string, number>, skill: string) => {
        acc[skill] = (acc[skill] || 0) + 1
        return acc
      }, {})

      const topSkills = Object.entries(skillCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }))

      return {
        total,
        active,
        inactive,
        topSkills,
        totalSkills: Object.keys(skillCounts).length,
      }
    }),

  getSkills: publicProcedure
    .query(async ({ ctx }) => {
      const members = await ctx.prisma.teamMember.findMany({
        where: { isActive: true },
        select: { skills: true },
      })

      const allSkills = [...new Set(members.flatMap(member => member.skills))]
      return allSkills.sort()
    }),
})