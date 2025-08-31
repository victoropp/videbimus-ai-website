import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from "../init"
import { ContactStatus, Priority } from "@prisma/client"
import { sendContactNotificationEmail } from "@/lib/email"

const createContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

const updateContactSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(ContactStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
})

const getContactsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.nativeEnum(ContactStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  search: z.string().optional(),
})

export const contactRouter = createTRPCRouter({
  create: publicProcedure
    .input(createContactSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, email, company, phone, subject, message } = input

      // Create contact submission
      const contact = await ctx.prisma.contact.create({
        data: {
          name,
          email,
          company,
          phone,
          subject,
          message,
          status: ContactStatus.NEW,
          priority: Priority.MEDIUM,
          userId: ctx.session?.user?.id,
        },
      })

      // Send notification email to admin
      try {
        await sendContactNotificationEmail({
          name,
          email,
          company,
          phone,
          subject,
          message,
          contactId: contact.id,
        })
      } catch (error) {
        console.error("Failed to send contact notification email:", error)
        // Don't throw error - contact was created successfully
      }

      return { 
        contact: { id: contact.id },
        message: "Contact form submitted successfully" 
      }
    }),

  getAll: adminProcedure
    .input(getContactsSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, status, priority, search } = input
      const skip = (page - 1) * limit

      const where = {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
            { subject: { contains: search, mode: "insensitive" as const } },
            { message: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      }

      const [contacts, total] = await Promise.all([
        ctx.prisma.contact.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.prisma.contact.count({ where }),
      ])

      return {
        contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        })
      }

      return contact
    }),

  update: adminProcedure
    .input(updateContactSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const contact = await ctx.prisma.contact.update({
        where: { id },
        data: {
          ...updateData,
          ...(input.status === ContactStatus.RESPONDED && {
            respondedAt: new Date(),
          }),
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      return { contact, message: "Contact updated successfully" }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.contact.delete({
        where: { id: input.id },
      })

      return { message: "Contact deleted successfully" }
    }),

  getStats: adminProcedure.query(async ({ ctx }) => {
    const [total, newContacts, inProgress, responded] = await Promise.all([
      ctx.prisma.contact.count(),
      ctx.prisma.contact.count({ where: { status: ContactStatus.NEW } }),
      ctx.prisma.contact.count({ where: { status: ContactStatus.IN_PROGRESS } }),
      ctx.prisma.contact.count({ where: { status: ContactStatus.RESPONDED } }),
    ])

    return {
      total,
      new: newContacts,
      inProgress,
      responded,
    }
  }),
})