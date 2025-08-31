import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { Decimal } from 'decimal.js'

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
        if (ctx.user.role !== 'ADMIN') {
          whereClause.clientId = ctx.user.id
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
          ctx.db.invoice.findMany({
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
          ctx.db.invoice.count({ where: whereClause }),
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
        const invoice = await ctx.db.invoice.findUnique({
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
        if (ctx.user.role !== 'ADMIN' && invoice.clientId !== ctx.user.id) {
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
          const lastInvoice = await ctx.db.invoice.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { number: true },
          })

          const lastNumber = lastInvoice?.number ? parseInt(lastInvoice.number.replace(/\D/g, '')) || 0 : 0
          invoiceData.number = `INV-${String(lastNumber + 1).padStart(6, '0')}`
        }

        // Create invoice with items
        const invoice = await ctx.db.invoice.create({
          data: {
            ...invoiceData,
            amount: new Decimal(invoiceData.amount),
            tax: invoiceData.tax ? new Decimal(invoiceData.tax) : undefined,
            total: new Decimal(invoiceData.total),
            items: {
              create: items.map(item => ({
                ...item,
                quantity: new Decimal(item.quantity),
                rate: new Decimal(item.rate),
                amount: new Decimal(item.amount),
              })),
            },
          },
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
        const invoice = await ctx.db.invoice.findUnique({
          where: { id: input.id },
        })

        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        const { items, ...updateData } = input.data

        // Convert decimal fields
        if (updateData.amount !== undefined) {
          updateData.amount = new Decimal(updateData.amount) as any
        }
        if (updateData.tax !== undefined && updateData.tax !== null) {
          updateData.tax = new Decimal(updateData.tax) as any
        }
        if (updateData.total !== undefined) {
          updateData.total = new Decimal(updateData.total) as any
        }

        const updatedInvoice = await ctx.db.$transaction(async (tx) => {
          // Update invoice
          const invoice = await tx.invoice.update({
            where: { id: input.id },
            data: updateData,
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
                quantity: new Decimal(item.quantity),
                rate: new Decimal(item.rate),
                amount: new Decimal(item.amount),
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
        const invoice = await ctx.db.invoice.findUnique({
          where: { id: input.id },
        })

        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        // Check if invoice has payments
        const paymentCount = await ctx.db.payment.count({
          where: { invoiceId: input.id },
        })

        if (paymentCount > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete invoice with payments',
          })
        }

        return ctx.db.invoice.delete({
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
        if (ctx.user.role !== 'ADMIN') {
          whereClause.invoice = {
            clientId: ctx.user.id,
          }
        }

        const [payments, total] = await Promise.all([
          ctx.db.payment.findMany({
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
          ctx.db.payment.count({ where: whereClause }),
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
        return ctx.db.payment.create({
          data: {
            ...input,
            amount: new Decimal(input.amount),
            status: 'COMPLETED', // Default to completed for manual entries
            processedAt: input.processedAt || new Date(),
          },
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
        const payment = await ctx.db.payment.findUnique({
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
          updateData.amount = new Decimal(updateData.amount) as any
        }

        return ctx.db.payment.update({
          where: { id: input.id },
          data: updateData,
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
        ctx.db.invoice.count({ where: whereClause }),
        ctx.db.invoice.count({ where: { ...whereClause, status: 'PAID' } }),
        ctx.db.invoice.count({ where: { ...whereClause, status: 'OVERDUE' } }),
        ctx.db.payment.aggregate({
          where: {
            status: 'COMPLETED',
            ...(whereClause.createdAt ? { createdAt: whereClause.createdAt } : {}),
          },
          _sum: { amount: true },
        }),
        ctx.db.invoice.aggregate({
          where: {
            ...whereClause,
            status: { in: ['SENT', 'OVERDUE'] },
          },
          _sum: { total: true },
        }),
        ctx.db.payment.groupBy({
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
        draftInvoices: await ctx.db.invoice.count({ where: { ...whereClause, status: 'DRAFT' } }),
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
      const payments = await ctx.db.payment.findMany({
        where: {
          status: 'COMPLETED',
          processedAt: {
            gte: input.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            lte: input.endDate || new Date(),
          },
        },
        select: {
          amount: true,
          processedAt: true,
        },
        orderBy: { processedAt: 'asc' },
      })

      // Group payments by period (simplified)
      const chartData = payments.map(payment => ({
        date: payment.processedAt?.toISOString().split('T')[0] || '',
        amount: payment.amount.toNumber(),
      }))

      return chartData
    }),
})