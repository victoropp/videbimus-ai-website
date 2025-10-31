import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../init'
import { TRPCError } from '@trpc/server'

const invoiceItemSchema = z.object({
  description: z.string().min(1).max(200),
  quantity: z.number().min(0.01).max(99999),
  rate: z.number().min(0).max(999999),
  amount: z.number().min(0).max(999999),
})

const invoiceSchema = z.object({
  number: z.string().min(1).max(50).optional(),
  amount: z.number().min(0).max(999999),
  tax: z.number().min(0).max(999999).optional(),
  total: z.number().min(0).max(999999),
  currency: z.string().min(3).max(3).default('USD'),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']).default('DRAFT'),
  issuedDate: z.date().optional(),
  dueDate: z.date().optional(),
  description: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  projectId: z.string().optional(),
  clientId: z.string(),
  items: z.array(invoiceItemSchema).default([]),
})

const paymentSchema = z.object({
  amount: z.number().min(0.01).max(999999),
  currency: z.string().min(3).max(3).default('USD'),
  method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'WIRE_TRANSFER', 'CHECK', 'CASH']),
  transactionId: z.string().max(100).optional(),
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  processedAt: z.date().optional(),
  invoiceId: z.string(),
})

export const financialRouter = createTRPCRouter({
  // Invoice routes
  invoices: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({
        clientId: z.string().optional(),
        projectId: z.string().optional(),
        status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const whereClause: any = {}

        // Non-admin users can only see their own invoices
        if (ctx.session.user.role !== 'ADMIN') {
          whereClause.clientId = ctx.session.user.id
        } else if (input.clientId) {
          whereClause.clientId = input.clientId
        }

        if (input.projectId) {
          whereClause.projectId = input.projectId
        }

        if (input.status) {
          whereClause.status = input.status
        }

        const [invoices, total] = await Promise.all([
          ctx.prisma.invoice.findMany({
            where: whereClause,
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              project: {
                select: {
                  id: true,
                  title: true,
                },
              },
              items: true,
              payments: true,
            },
            orderBy: { createdAt: 'desc' },
            take: input.limit,
            skip: input.offset,
          }),
          ctx.prisma.invoice.count({ where: whereClause }),
        ])

        return {
          invoices,
          total,
          hasMore: input.offset + input.limit < total,
        }
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const invoice = await ctx.prisma.invoice.findUnique({
          where: { id: input.id },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            project: {
              select: {
                id: true,
                title: true,
              },
            },
            items: true,
            payments: true,
          },
        })

        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        // Check permissions
        if (ctx.session.user.role !== 'ADMIN' && invoice.clientId !== ctx.session.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          })
        }

        return invoice
      }),

    create: adminProcedure
      .input(invoiceSchema)
      .mutation(async ({ ctx, input }) => {
        const { items, ...invoiceData } = input

        // Generate invoice number if not provided
        if (!invoiceData.number) {
          const lastInvoice = await ctx.prisma.invoice.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { number: true },
          })

          const lastNumber = lastInvoice?.number ? parseInt(lastInvoice.number.replace(/\D/g, '')) || 0 : 0
          invoiceData.number = `INV-${String(lastNumber + 1).padStart(6, '0')}`
        }

        // Create invoice with items
        const invoice = await ctx.prisma.invoice.create({
          data: {
            ...invoiceData,
            amount: invoiceData.amount,
            tax: invoiceData.tax,
            total: invoiceData.total,
            items: {
              create: items.map(item => ({
                ...item,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
              })),
            },
          } as any,
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            project: {
              select: {
                id: true,
                title: true,
              },
            },
            items: true,
          },
        })

        return invoice
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        data: invoiceSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await ctx.prisma.invoice.findUnique({
          where: { id: input.id },
        })

        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        const { items, ...updateData } = input.data as any

        // Convert decimal fields
        if (updateData.amount !== undefined) {
          updateData.amount = updateData.amount as any
        }
        if (updateData.tax !== undefined && updateData.tax !== null) {
          updateData.tax = updateData.tax as any
        }
        if (updateData.total !== undefined) {
          updateData.total = updateData.total as any
        }

        const updatedInvoice = await ctx.prisma.$transaction(async (tx) => {
          // Update invoice
          const invoice = await tx.invoice.update({
            where: { id: input.id },
            data: updateData as any,
          })

          // Update items if provided
          if (items) {
            // Delete existing items
            await tx.invoiceItem.deleteMany({
              where: { invoiceId: input.id },
            })

            // Create new items
            await tx.invoiceItem.createMany({
              data: items.map(item => ({
                ...item,
                invoiceId: input.id,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
              })),
            })
          }

          return tx.invoice.findUnique({
            where: { id: input.id },
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              project: {
                select: {
                  id: true,
                  title: true,
                },
              },
              items: true,
              payments: true,
            },
          })
        })

        return updatedInvoice
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await ctx.prisma.invoice.findUnique({
          where: { id: input.id },
        })

        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        // Check if invoice has payments
        const paymentCount = await ctx.prisma.payment.count({
          where: { invoiceId: input.id },
        })

        if (paymentCount > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete invoice with payments',
          })
        }

        return ctx.prisma.invoice.delete({
          where: { id: input.id },
        })
      }),
  }),

  // Payment routes
  payments: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({
        invoiceId: z.string().optional(),
        status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const whereClause: any = {}

        if (input.invoiceId) {
          whereClause.invoiceId = input.invoiceId
        }

        if (input.status) {
          whereClause.status = input.status
        }

        // Non-admin users can only see payments for their invoices
        if (ctx.session.user.role !== 'ADMIN') {
          whereClause.invoice = {
            clientId: ctx.session.user.id,
          }
        }

        const [payments, total] = await Promise.all([
          ctx.prisma.payment.findMany({
            where: whereClause,
            include: {
              invoice: {
                select: {
                  id: true,
                  number: true,
                  client: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: input.limit,
            skip: input.offset,
          }),
          ctx.prisma.payment.count({ where: whereClause }),
        ])

        return {
          payments,
          total,
          hasMore: input.offset + input.limit < total,
        }
      }),

    create: adminProcedure
      .input(paymentSchema)
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.payment.create({
          data: {
            ...input,
            amount: input.amount,
            status: 'COMPLETED', // Default to completed for manual entries
            processedAt: input.processedAt || new Date(),
          } as any,
          include: {
            invoice: {
              select: {
                id: true,
                number: true,
                client: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        })
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        data: paymentSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        const payment = await ctx.prisma.payment.findUnique({
          where: { id: input.id },
        })

        if (!payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payment not found',
          })
        }

        const updateData = { ...input.data }
        if (updateData.amount !== undefined) {
          updateData.amount = updateData.amount as any
        }

        return ctx.prisma.payment.update({
          where: { id: input.id },
          data: updateData as any,
          include: {
            invoice: {
              select: {
                id: true,
                number: true,
                client: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        })
      }),
  }),

  // Analytics
  getFinancialStats: adminProcedure
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
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        totalRevenue,
        pendingRevenue,
        paymentStats,
      ] = await Promise.all([
        ctx.prisma.invoice.count({ where: whereClause }),
        ctx.prisma.invoice.count({ where: { ...whereClause, status: 'PAID' } }),
        ctx.prisma.invoice.count({ where: { ...whereClause, status: 'OVERDUE' } }),
        ctx.prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            ...(whereClause.createdAt ? { createdAt: whereClause.createdAt } : {}),
          },
          _sum: { amount: true },
        }),
        ctx.prisma.invoice.aggregate({
          where: {
            ...whereClause,
            status: { in: ['SENT', 'OVERDUE'] },
          },
          _sum: { total: true },
        }),
        ctx.prisma.payment.groupBy({
          by: ['method'],
          _count: true,
          _sum: { amount: true },
          where: {
            status: 'COMPLETED',
            ...(whereClause.createdAt ? { createdAt: whereClause.createdAt } : {}),
          },
        }),
      ])

      return {
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        draftInvoices: await ctx.prisma.invoice.count({ where: { ...whereClause, status: 'DRAFT' } }),
        totalRevenue: totalRevenue._sum.amount?.toNumber() || 0,
        pendingRevenue: pendingRevenue._sum.total?.toNumber() || 0,
        paymentMethodStats: paymentStats.map(stat => ({
          method: stat.method,
          count: stat._count,
          amount: stat._sum.amount?.toNumber() || 0,
        })),
      }
    }),

  getRevenueChart: adminProcedure
    .input(z.object({
      period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // This would typically use a raw query for better performance
      // For now, we'll use a simplified approach
      const payments = await ctx.prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          processedAt: {
            gte: input.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            lte: input.endDate || new Date(),
          },
        } as any,
        select: {
          amount: true,
          processedAt: true,
        } as any,
        orderBy: { processedAt: 'asc' },
      })

      // Group payments by period (simplified)
      const chartData = (payments as any[]).map((payment: any) => ({
        date: payment.processedAt?.toISOString?.().split('T')[0] || '',
        amount: typeof payment.amount === 'number' ? payment.amount : (payment.amount?.toNumber?.() || 0),
      }))

      return chartData
    }),
})