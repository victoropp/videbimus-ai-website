import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, publicProcedure, adminProcedure } from "../init"
import { NewsletterStatus } from "@prisma/client"
import { sendWelcomeEmail } from "@/lib/email"

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  preferences: z.record(z.boolean()).optional(),
})

const updateSubscriptionSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(NewsletterStatus),
  preferences: z.record(z.boolean()).optional(),
})

const getSubscriptionsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.nativeEnum(NewsletterStatus).optional(),
  search: z.string().optional(),
})

export const newsletterRouter = createTRPCRouter({
  subscribe: publicProcedure
    .input(subscribeSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, preferences } = input

      // Check if already subscribed
      const existingSubscription = await ctx.prisma.newsletter.findUnique({
        where: { email },
      })

      if (existingSubscription) {
        if (existingSubscription.status === NewsletterStatus.SUBSCRIBED) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email is already subscribed to newsletter",
          })
        } else {
          // Reactivate subscription
          const subscription = await ctx.prisma.newsletter.update({
            where: { email },
            data: {
              status: NewsletterStatus.SUBSCRIBED,
              preferences,
              userId: ctx.session?.user?.id,
              updatedAt: new Date(),
            },
          })

          return {
            subscription: { id: subscription.id },
            message: "Successfully resubscribed to newsletter",
          }
        }
      }

      // Create new subscription
      const subscription = await ctx.prisma.newsletter.create({
        data: {
          email,
          status: NewsletterStatus.SUBSCRIBED,
          preferences,
          userId: ctx.session?.user?.id,
        },
      })

      // Send welcome email
      try {
        await sendWelcomeEmail({ email })
      } catch (error) {
        console.error("Failed to send welcome email:", error)
        // Don't throw error - subscription was created successfully
      }

      return {
        subscription: { id: subscription.id },
        message: "Successfully subscribed to newsletter",
      }
    }),

  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.prisma.newsletter.findUnique({
        where: { email: input.email },
      })

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email not found in newsletter subscriptions",
        })
      }

      await ctx.prisma.newsletter.update({
        where: { email: input.email },
        data: {
          status: NewsletterStatus.UNSUBSCRIBED,
          updatedAt: new Date(),
        },
      })

      return { message: "Successfully unsubscribed from newsletter" }
    }),

  getAll: adminProcedure
    .input(getSubscriptionsSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, status, search } = input
      const skip = (page - 1) * limit

      const where = {
        ...(status && { status }),
        ...(search && {
          email: { contains: search, mode: "insensitive" as const },
        }),
      }

      const [subscriptions, total] = await Promise.all([
        ctx.prisma.newsletter.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        }),
        ctx.prisma.newsletter.count({ where }),
      ])

      return {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    }),

  update: adminProcedure
    .input(updateSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const subscription = await ctx.prisma.newsletter.update({
        where: { id },
        data: updateData,
      })

      return { subscription, message: "Subscription updated successfully" }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.newsletter.delete({
        where: { id: input.id },
      })

      return { message: "Subscription deleted successfully" }
    }),

  getStats: adminProcedure.query(async ({ ctx }) => {
    const [total, subscribed, unsubscribed, bounced, complained] = await Promise.all([
      ctx.prisma.newsletter.count(),
      ctx.prisma.newsletter.count({ where: { status: NewsletterStatus.SUBSCRIBED } }),
      ctx.prisma.newsletter.count({ where: { status: NewsletterStatus.UNSUBSCRIBED } }),
      ctx.prisma.newsletter.count({ where: { status: NewsletterStatus.BOUNCED } }),
      ctx.prisma.newsletter.count({ where: { status: NewsletterStatus.COMPLAINED } }),
    ])

    return {
      total,
      subscribed,
      unsubscribed,
      bounced,
      complained,
    }
  }),
})