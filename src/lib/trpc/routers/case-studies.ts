import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import slugify from 'slugify'

const caseStudyResultSchema = z.object({
  metric: z.string().min(1).max(100),
  value: z.string().min(1).max(50),
})

const caseStudySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  client: z.string().min(1).max(100),
  industry: z.string().min(1).max(50),
  image: z.string().url().optional(),
  slug: z.string().min(1).max(200).optional(),
  tags: z.array(z.string()).default([]),
  results: z.array(caseStudyResultSchema).default([]),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  featured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  publishedAt: z.date().optional(),
  authorId: z.string().optional(),
})

const updateCaseStudySchema = caseStudySchema.partial()

export const caseStudiesRouter = createTRPCRouter({
  // Public routes
  list: publicProcedure
    .input(z.object({
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
      featured: z.boolean().optional(),
      industry: z.string().optional(),
      tags: z.array(z.string()).optional(),
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        status: input.status,
      }

      if (input.featured !== undefined) {
        whereClause.featured = input.featured
      }

      if (input.industry) {
        whereClause.industry = {
          equals: input.industry,
          mode: 'insensitive',
        }
      }

      if (input.tags && input.tags.length > 0) {
        whereClause.tags = {
          hasSome: input.tags,
        }
      }

      const [caseStudies, total] = await Promise.all([
        ctx.db.caseStudyEntry.findMany({
          where: whereClause,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: [
            { featured: 'desc' },
            { sortOrder: 'asc' },
            { publishedAt: 'desc' },
            { createdAt: 'desc' }
          ],
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.caseStudyEntry.count({ where: whereClause }),
      ])

      return {
        caseStudies,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const caseStudy = await ctx.db.caseStudyEntry.findUnique({
        where: { 
          slug: input.slug,
          status: 'PUBLISHED',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          files: true,
        },
      })

      if (!caseStudy) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Case study not found',
        })
      }

      return caseStudy
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const caseStudy = await ctx.db.caseStudyEntry.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          files: true,
        },
      })

      if (!caseStudy) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Case study not found',
        })
      }

      // Check permissions
      if (ctx.user.role !== 'ADMIN' && caseStudy.authorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        })
      }

      return caseStudy
    }),

  // Admin/Author routes
  create: protectedProcedure
    .input(caseStudySchema)
    .mutation(async ({ ctx, input }) => {
      const data = {
        ...input,
        authorId: ctx.user.id,
      }

      // Generate slug if not provided
      if (!data.slug) {
        data.slug = slugify(data.title, { lower: true, strict: true })
      }

      // Check if slug is unique
      const existing = await ctx.db.caseStudyEntry.findUnique({
        where: { slug: data.slug },
      })

      if (existing) {
        data.slug = `${data.slug}-${Date.now()}`
      }

      // Set publishedAt if publishing
      if (data.status === 'PUBLISHED' && !data.publishedAt) {
        data.publishedAt = new Date()
      }

      return ctx.db.caseStudyEntry.create({
        data,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateCaseStudySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const caseStudy = await ctx.db.caseStudyEntry.findUnique({
        where: { id: input.id },
      })

      if (!caseStudy) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Case study not found',
        })
      }

      // Check permissions
      if (ctx.user.role !== 'ADMIN' && caseStudy.authorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        })
      }

      const updateData = { ...input.data }

      // Handle slug update
      if (updateData.slug && updateData.slug !== caseStudy.slug) {
        const existing = await ctx.db.caseStudyEntry.findUnique({
          where: { slug: updateData.slug },
        })

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Slug already in use',
          })
        }
      }

      // Handle publish date
      if (updateData.status === 'PUBLISHED' && caseStudy.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date()
      }

      return ctx.db.caseStudyEntry.update({
        where: { id: input.id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const caseStudy = await ctx.db.caseStudyEntry.findUnique({
        where: { id: input.id },
      })

      if (!caseStudy) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Case study not found',
        })
      }

      // Check permissions
      if (ctx.user.role !== 'ADMIN' && caseStudy.authorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        })
      }

      return ctx.db.caseStudyEntry.delete({
        where: { id: input.id },
      })
    }),

  // Analytics and search
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.caseStudyEntry.findMany({
        where: {
          status: input.status,
          OR: [
            { title: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
            { client: { contains: input.query, mode: 'insensitive' } },
            { industry: { contains: input.query, mode: 'insensitive' } },
            { tags: { hasSome: [input.query] } },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
        ],
      })
    }),

  getIndustries: publicProcedure
    .query(async ({ ctx }) => {
      const industries = await ctx.db.caseStudyEntry.findMany({
        where: { status: 'PUBLISHED' },
        select: { industry: true },
        distinct: ['industry'],
      })

      return industries.map(i => i.industry).sort()
    }),

  getTags: publicProcedure
    .query(async ({ ctx }) => {
      const caseStudies = await ctx.db.caseStudyEntry.findMany({
        where: { status: 'PUBLISHED' },
        select: { tags: true },
      })

      const allTags = [...new Set(caseStudies.flatMap(cs => cs.tags))]
      return allTags.sort()
    }),

  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [total, published, draft, archived] = await Promise.all([
        ctx.db.caseStudyEntry.count(),
        ctx.db.caseStudyEntry.count({ where: { status: 'PUBLISHED' } }),
        ctx.db.caseStudyEntry.count({ where: { status: 'DRAFT' } }),
        ctx.db.caseStudyEntry.count({ where: { status: 'ARCHIVED' } }),
      ])

      const industryStats = await ctx.db.caseStudyEntry.groupBy({
        by: ['industry'],
        _count: true,
        where: { status: 'PUBLISHED' },
      })

      return {
        total,
        published,
        draft,
        archived,
        featured: await ctx.db.caseStudyEntry.count({ where: { featured: true, status: 'PUBLISHED' } }),
        industryStats: industryStats.map(stat => ({
          industry: stat.industry,
          count: stat._count,
        })),
      }
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
        ctx.db.caseStudyEntry.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )

      await ctx.db.$transaction(updates)
      return { success: true }
    }),

  toggleFeatured: adminProcedure
    .input(z.object({
      id: z.string(),
      featured: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.caseStudyEntry.update({
        where: { id: input.id },
        data: { featured: input.featured },
      })
    }),
})