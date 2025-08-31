import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../init'
import { TRPCError } from '@trpc/server'

const analyticsEventSchema = z.object({
  event: z.string().min(1).max(100),
  page: z.string().max(200).optional(),
  referrer: z.string().max(200).optional(),
  userAgent: z.string().max(500).optional(),
  ipAddress: z.string().max(45).optional(),
  country: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  device: z.string().max(50).optional(),
  browser: z.string().max(50).optional(),
  os: z.string().max(50).optional(),
  properties: z.record(z.any()).optional(),
})

const userActivitySchema = z.object({
  action: z.string().min(1).max(100),
  resource: z.string().max(200).optional(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
})

const performanceMetricSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.any(),
  type: z.enum(['COUNTER', 'GAUGE', 'HISTOGRAM', 'SUMMARY', 'RATE']),
  category: z.string().min(1).max(50),
  unit: z.string().max(20).optional(),
  metadata: z.record(z.any()).optional(),
})

export const analyticsRouter = createTRPCRouter({
  // Public analytics tracking
  trackEvent: publicProcedure
    .input(analyticsEventSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.analytics.create({
        data: {
          userId: ctx.user?.id,
          sessionId: ctx.session?.sessionToken,
          ...input,
        },
      })
    }),

  // User activity tracking
  trackActivity: protectedProcedure
    .input(userActivitySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userActivity.create({
        data: {
          userId: ctx.user.id,
          sessionId: ctx.session?.sessionToken,
          ...input,
          timestamp: new Date(),
        },
      })
    }),

  // Performance metrics
  recordMetric: adminProcedure
    .input(performanceMetricSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.performanceMetric.create({
        data: input,
      })
    }),

  // System health
  updateSystemHealth: adminProcedure
    .input(z.object({
      service: z.string().min(1).max(50),
      status: z.enum(['healthy', 'degraded', 'down']),
      responseTime: z.number().min(0).optional(),
      uptime: z.number().min(0).max(100).optional(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.systemHealth.upsert({
        where: { service: input.service },
        update: {
          status: input.status,
          responseTime: input.responseTime,
          uptime: input.uptime,
          metadata: input.metadata,
          lastCheck: new Date(),
        },
        create: {
          service: input.service,
          status: input.status,
          responseTime: input.responseTime,
          uptime: input.uptime,
          metadata: input.metadata,
          lastCheck: new Date(),
        },
      })
    }),

  // Analytics queries
  getPageViews: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      page: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        event: 'page_view',
      }

      if (input.startDate || input.endDate) {
        whereClause.createdAt = {}
        if (input.startDate) {
          whereClause.createdAt.gte = input.startDate
        }
        if (input.endDate) {
          whereClause.createdAt.lte = input.endDate
        }
      }

      if (input.page) {
        whereClause.page = input.page
      }

      const [views, uniqueViews] = await Promise.all([
        ctx.db.analytics.count({ where: whereClause }),
        ctx.db.analytics.findMany({
          where: whereClause,
          select: { userId: true, sessionId: true },
          distinct: ['userId', 'sessionId'],
        }),
      ])

      return {
        totalViews: views,
        uniqueViews: uniqueViews.length,
      }
    }),

  getTopPages: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        event: 'page_view',
        page: { not: null },
      }

      if (input.startDate || input.endDate) {
        whereClause.createdAt = {}
        if (input.startDate) {
          whereClause.createdAt.gte = input.startDate
        }
        if (input.endDate) {
          whereClause.createdAt.lte = input.endDate
        }
      }

      const topPages = await ctx.db.analytics.groupBy({
        by: ['page'],
        _count: true,
        where: whereClause,
        orderBy: { _count: { page: 'desc' } },
        take: input.limit,
      })

      return topPages.map(page => ({
        page: page.page,
        views: page._count,
      }))
    }),

  getTrafficSources: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        event: 'page_view',
        referrer: { not: null },
      }

      if (input.startDate || input.endDate) {
        whereClause.createdAt = {}
        if (input.startDate) {
          whereClause.createdAt.gte = input.startDate
        }
        if (input.endDate) {
          whereClause.createdAt.lte = input.endDate
        }
      }

      const sources = await ctx.db.analytics.groupBy({
        by: ['referrer'],
        _count: true,
        where: whereClause,
        orderBy: { _count: { referrer: 'desc' } },
        take: 20,
      })

      return sources.map(source => ({
        referrer: source.referrer,
        visits: source._count,
      }))
    }),

  getDeviceStats: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        event: 'page_view',
      }

      if (input.startDate || input.endDate) {
        whereClause.createdAt = {}
        if (input.startDate) {
          whereClause.createdAt.gte = input.startDate
        }
        if (input.endDate) {
          whereClause.createdAt.lte = input.endDate
        }
      }

      const [devices, browsers, os] = await Promise.all([
        ctx.db.analytics.groupBy({
          by: ['device'],
          _count: true,
          where: { ...whereClause, device: { not: null } },
        }),
        ctx.db.analytics.groupBy({
          by: ['browser'],
          _count: true,
          where: { ...whereClause, browser: { not: null } },
        }),
        ctx.db.analytics.groupBy({
          by: ['os'],
          _count: true,
          where: { ...whereClause, os: { not: null } },
        }),
      ])

      return {
        devices: devices.map(d => ({ device: d.device, count: d._count })),
        browsers: browsers.map(b => ({ browser: b.browser, count: b._count })),
        operatingSystems: os.map(o => ({ os: o.os, count: o._count })),
      }
    }),

  getGeographicStats: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        event: 'page_view',
      }

      if (input.startDate || input.endDate) {
        whereClause.createdAt = {}
        if (input.startDate) {
          whereClause.createdAt.gte = input.startDate
        }
        if (input.endDate) {
          whereClause.createdAt.lte = input.endDate
        }
      }

      const [countries, cities] = await Promise.all([
        ctx.db.analytics.groupBy({
          by: ['country'],
          _count: true,
          where: { ...whereClause, country: { not: null } },
          orderBy: { _count: { country: 'desc' } },
          take: 20,
        }),
        ctx.db.analytics.groupBy({
          by: ['city'],
          _count: true,
          where: { ...whereClause, city: { not: null } },
          orderBy: { _count: { city: 'desc' } },
          take: 20,
        }),
      ])

      return {
        countries: countries.map(c => ({ country: c.country, count: c._count })),
        cities: cities.map(c => ({ city: c.city, count: c._count })),
      }
    }),

  // User activity analytics
  getUserActivityStats: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      userId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {}

      if (input.startDate || input.endDate) {
        whereClause.timestamp = {}
        if (input.startDate) {
          whereClause.timestamp.gte = input.startDate
        }
        if (input.endDate) {
          whereClause.timestamp.lte = input.endDate
        }
      }

      if (input.userId) {
        whereClause.userId = input.userId
      }

      const [totalActivities, topActions, activeUsers] = await Promise.all([
        ctx.db.userActivity.count({ where: whereClause }),
        ctx.db.userActivity.groupBy({
          by: ['action'],
          _count: true,
          where: whereClause,
          orderBy: { _count: { action: 'desc' } },
          take: 10,
        }),
        ctx.db.userActivity.findMany({
          where: whereClause,
          select: { userId: true },
          distinct: ['userId'],
        }),
      ])

      return {
        totalActivities,
        activeUsers: activeUsers.length,
        topActions: topActions.map(action => ({
          action: action.action,
          count: action._count,
        })),
      }
    }),

  // Performance metrics
  getPerformanceMetrics: adminProcedure
    .input(z.object({
      name: z.string().optional(),
      category: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      limit: z.number().min(1).max(1000).default(100),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {}

      if (input.name) {
        whereClause.name = input.name
      }

      if (input.category) {
        whereClause.category = input.category
      }

      if (input.startDate || input.endDate) {
        whereClause.timestamp = {}
        if (input.startDate) {
          whereClause.timestamp.gte = input.startDate
        }
        if (input.endDate) {
          whereClause.timestamp.lte = input.endDate
        }
      }

      return ctx.db.performanceMetric.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: input.limit,
      })
    }),

  // System health
  getSystemHealth: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.db.systemHealth.findMany({
        orderBy: { lastCheck: 'desc' },
      })
    }),

  // Dashboard data
  getDashboardStats: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {}

      if (input.startDate || input.endDate) {
        whereClause.createdAt = {}
        if (input.startDate) {
          whereClause.createdAt.gte = input.startDate
        }
        if (input.endDate) {
          whereClause.createdAt.lte = input.endDate
        }
      }

      const [
        totalPageViews,
        uniqueVisitors,
        newUsers,
        totalUsers,
        activeProjects,
        totalContacts,
      ] = await Promise.all([
        ctx.db.analytics.count({
          where: { ...whereClause, event: 'page_view' },
        }),
        ctx.db.analytics.findMany({
          where: { ...whereClause, event: 'page_view' },
          select: { sessionId: true },
          distinct: ['sessionId'],
        }),
        ctx.db.user.count({
          where: whereClause,
        }),
        ctx.db.user.count(),
        ctx.db.project.count({
          where: {
            status: { in: ['PLANNING', 'IN_PROGRESS'] },
          },
        }),
        ctx.db.contact.count({
          where: whereClause,
        }),
      ])

      return {
        totalPageViews,
        uniqueVisitors: uniqueVisitors.length,
        newUsers,
        totalUsers,
        activeProjects,
        totalContacts,
      }
    }),

  // Real-time analytics
  getRealTimeStats: adminProcedure
    .query(async ({ ctx }) => {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const lastHour = new Date(Date.now() - 60 * 60 * 1000)

      const [
        visitorsLast24h,
        visitorsLastHour,
        onlineUsers,
        recentActivities,
      ] = await Promise.all([
        ctx.db.analytics.findMany({
          where: {
            event: 'page_view',
            createdAt: { gte: last24Hours },
          },
          select: { sessionId: true },
          distinct: ['sessionId'],
        }),
        ctx.db.analytics.findMany({
          where: {
            event: 'page_view',
            createdAt: { gte: lastHour },
          },
          select: { sessionId: true },
          distinct: ['sessionId'],
        }),
        ctx.db.userPresence.count({
          where: { isOnline: true },
        }),
        ctx.db.userActivity.findMany({
          where: {
            timestamp: { gte: lastHour },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { timestamp: 'desc' },
          take: 10,
        }),
      ])

      return {
        visitorsLast24h: visitorsLast24h.length,
        visitorsLastHour: visitorsLastHour.length,
        onlineUsers,
        recentActivities,
      }
    }),
})