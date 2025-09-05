import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../init'
import { TRPCError } from '@trpc/server'

const testimonialSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  content: z.string().min(10).max(1000),
  image: z.string().url().optional(),
  rating: z.number().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
})

const updateTestimonialSchema = testimonialSchema.partial()

export const testimonialsRouter = createTRPCRouter({
  // Public routes
  list: publicProcedure
    .input(z.object({
      isActive: z.boolean().default(true),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.testimonial.findMany({
        where: {
          isActive: input.isActive,
        },
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
      const testimonial = await ctx.db.testimonial.findUnique({
        where: { id: input.id },
      })

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found',
        })
      }

      return testimonial
    }),

  // Admin routes
  create: adminProcedure
    .input(testimonialSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.testimonial.create({
        data: {
          name: input.name,
          role: input.role,
          company: input.company,
          content: input.content,
          image: input.image,
          rating: input.rating,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
        },
      })
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      data: updateTestimonialSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.testimonial.findUnique({
        where: { id: input.id },
      })

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found',
        })
      }

      return ctx.db.testimonial.update({
        where: { id: input.id },
        data: input.data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.testimonial.findUnique({
        where: { id: input.id },
      })

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found',
        })
      }

      return ctx.db.testimonial.delete({
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
        ctx.db.testimonial.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )

      await ctx.db.$transaction(updates)
      return { success: true }
    }),

  toggleActive: adminProcedure
    .input(z.object({
      id: z.string(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.testimonial.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })
    }),

  // Analytics
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [total, active, inactive] = await Promise.all([
        ctx.db.testimonial.count(),
        ctx.db.testimonial.count({ where: { isActive: true } }),
        ctx.db.testimonial.count({ where: { isActive: false } }),
      ])

      const ratingStats = await ctx.db.testimonial.groupBy({
        by: ['rating'],
        _count: true,
        where: { isActive: true },
      })

      return {
        total,
        active,
        inactive,
        ratingStats: ratingStats.map(stat => ({
          rating: stat.rating,
          count: stat._count,
        })),
      }
    }),
})