import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure, consultantProcedure } from "../init"
import { 
  ConsultationStatus, 
  ConsultationType, 
  ConsultationRoomStatus,
  UserRole 
} from "@prisma/client"

// Input validation schemas
const createConsultationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  type: z.nativeEnum(ConsultationType),
  duration: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
  scheduledAt: z.date().optional(),
  projectId: z.string().optional(),
})

const updateConsultationSchema = z.object({
  id: z.string(),
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ConsultationStatus).optional(),
  scheduledAt: z.date().optional(),
  completedAt: z.date().optional(),
  notes: z.string().optional(),
})

const getConsultationsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  status: z.nativeEnum(ConsultationStatus).optional(),
  type: z.nativeEnum(ConsultationType).optional(),
  search: z.string().optional(),
})

// Consultation Room schemas
const createConsultationRoomSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters"),
  description: z.string().optional(),
  roomType: z.string().default("consultation"),
  clientId: z.string(),
  consultantId: z.string(),
  scheduledAt: z.date().optional(),
  durationMinutes: z.number().min(15).max(480).default(60),
  settings: z.record(z.any()).default({}),
  consultationId: z.string().optional(),
})

const updateConsultationRoomSchema = z.object({
  id: z.string(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ConsultationRoomStatus).optional(),
  settings: z.record(z.any()).optional(),
})

// Message schemas
const sendMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1, "Message cannot be empty"),
  messageType: z.string().default("text"),
  metadata: z.record(z.any()).default({}),
})

const updateMessageSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "Message cannot be empty"),
})

// Document schemas
const createDocumentSchema = z.object({
  roomId: z.string(),
  title: z.string().min(1, "Document title is required"),
  description: z.string().optional(),
  documentType: z.string().default("document"),
  content: z.string().optional(),
  isTemplate: z.boolean().default(false),
  isShared: z.boolean().default(true),
})

const updateDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  isShared: z.boolean().optional(),
})

// Action Item schemas
const createActionItemSchema = z.object({
  roomId: z.string(),
  title: z.string().min(1, "Action item title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assignedTo: z.string().optional(),
  dueDate: z.date().optional(),
})

const updateActionItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  dueDate: z.date().optional(),
  completionNotes: z.string().optional(),
})

export const consultationRouter = createTRPCRouter({
  // ============================================================================
  // CONSULTATION MANAGEMENT
  // ============================================================================

  // Create a new consultation
  create: protectedProcedure
    .input(createConsultationSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership if projectId is provided
      if (input.projectId) {
        const project = await ctx.prisma.project.findFirst({
          where: {
            id: input.projectId,
            userId: ctx.session.user.id,
          },
        })

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          })
        }
      }

      const consultation = await ctx.prisma.consultation.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        } as any,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          project: {
            select: {
              title: true,
            },
          },
        },
      })

      return { consultation, message: "Consultation created successfully" }
    }),

  // Get user's consultations
  getAll: protectedProcedure
    .input(getConsultationsSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, status, type, search } = input
      const skip = (page - 1) * limit

      const where = {
        userId: ctx.session.user.id,
        ...(status && { status }),
        ...(type && { type }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { notes: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      }

      const [consultations, total] = await Promise.all([
        ctx.prisma.consultation.findMany({
          where,
          orderBy: { scheduledAt: "desc" },
          skip,
          take: limit,
          include: {
            project: {
              select: {
                title: true,
              },
            },
            room: {
              select: {
                id: true,
                status: true,
              },
            },
            _count: {
              select: {
                files: true,
              },
            },
          },
        }),
        ctx.prisma.consultation.count({ where }),
      ])

      return {
        consultations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    }),

  // Get consultation by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const consultation = await ctx.prisma.consultation.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          project: true,
          room: {
            include: {
              client: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
              consultant: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  messages: true,
                  documents: true,
                  actionItems: true,
                },
              },
            },
          },
          files: true,
        },
      })

      if (!consultation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Consultation not found",
        })
      }

      return consultation
    }),

  // Update consultation
  update: protectedProcedure
    .input(updateConsultationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify ownership
      const existingConsultation = await ctx.prisma.consultation.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      })

      if (!existingConsultation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Consultation not found",
        })
      }

      const consultation = await ctx.prisma.consultation.update({
        where: { id },
        data: updateData,
        include: {
          project: {
            select: {
              title: true,
            },
          },
          room: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      })

      return { consultation, message: "Consultation updated successfully" }
    }),

  // Delete consultation
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const consultation = await ctx.prisma.consultation.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      if (!consultation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Consultation not found",
        })
      }

      await ctx.prisma.consultation.delete({
        where: { id: input.id },
      })

      return { message: "Consultation deleted successfully" }
    }),

  // ============================================================================
  // CONSULTATION ROOMS
  // ============================================================================

  // Create a consultation room
  createRoom: protectedProcedure
    .input(createConsultationRoomSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user can create room (must be consultant or admin)
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      })

      if (user?.role !== UserRole.CONSULTANT && user?.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only consultants can create consultation rooms",
        })
      }

      const room = await ctx.prisma.consultationRoom.create({
        data: input as any,
        include: {
          client: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          consultant: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          consultation: {
            select: {
              title: true,
              type: true,
            },
          },
        },
      })

      return { room, message: "Consultation room created successfully" }
    }),

  // Get consultation rooms
  getRooms: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
      status: z.nativeEnum(ConsultationRoomStatus).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, status, search } = input
      const skip = (page - 1) * limit

      const where = {
        OR: [
          { clientId: ctx.session.user.id },
          { consultantId: ctx.session.user.id },
        ],
        ...(status && { status }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      }

      const [rooms, total] = await Promise.all([
        ctx.prisma.consultationRoom.findMany({
          where,
          orderBy: { scheduledAt: "desc" },
          skip,
          take: limit,
          include: {
            client: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            consultant: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            _count: {
              select: {
                messages: true,
                documents: true,
                actionItems: true,
              },
            },
          },
        }),
        ctx.prisma.consultationRoom.count({ where }),
      ])

      return {
        rooms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    }),

  // Get room by ID
  getRoomById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.prisma.consultationRoom.findFirst({
        where: {
          id: input.id,
          OR: [
            { clientId: ctx.session.user.id },
            { consultantId: ctx.session.user.id },
          ],
        },
        include: {
          client: {
            select: {
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          consultant: {
            select: {
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          consultation: true,
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              sender: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          documents: {
            orderBy: { updatedAt: "desc" },
            include: {
              uploader: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          actionItems: {
            orderBy: { createdAt: "desc" },
            include: {
              assignee: {
                select: {
                  name: true,
                  email: true,
                },
              },
              creator: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          whiteboards: {
            orderBy: { updatedAt: "desc" },
          },
          participants: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          analytics: true,
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Consultation room not found",
        })
      }

      return room
    }),

  // Update consultation room
  updateRoom: protectedProcedure
    .input(updateConsultationRoomSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify access (client or consultant)
      const existingRoom = await ctx.prisma.consultationRoom.findFirst({
        where: {
          id,
          OR: [
            { clientId: ctx.session.user.id },
            { consultantId: ctx.session.user.id },
          ],
        },
      })

      if (!existingRoom) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Consultation room not found",
        })
      }

      const room = await ctx.prisma.consultationRoom.update({
        where: { id },
        data: updateData,
      })

      return { room, message: "Room updated successfully" }
    }),

  // ============================================================================
  // MESSAGES
  // ============================================================================

  // Send a message
  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to room
      const room = await ctx.prisma.consultationRoom.findFirst({
        where: {
          id: input.roomId,
          OR: [
            { clientId: ctx.session.user.id },
            { consultantId: ctx.session.user.id },
          ],
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      const message = await ctx.prisma.consultationMessage.create({
        data: {
          ...input,
          senderId: ctx.session.user.id,
        } as any,
        include: {
          sender: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })

      return { message, success: true }
    }),

  // Get room messages
  getRoomMessages: protectedProcedure
    .input(z.object({ 
      roomId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      // Verify access to room
      const room = await ctx.prisma.consultationRoom.findFirst({
        where: {
          id: input.roomId,
          OR: [
            { clientId: ctx.session.user.id },
            { consultantId: ctx.session.user.id },
          ],
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      const messages = await ctx.prisma.consultationMessage.findMany({
        where: { 
          roomId: input.roomId,
          isDeleted: false,
          ...(input.cursor && {
            createdAt: {
              lt: new Date(input.cursor),
            },
          }),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: {
          sender: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })

      return {
        messages: messages.reverse(), // Return in chronological order
        nextCursor: messages.length > 0 ? messages[0].createdAt.toISOString() : null,
      }
    }),

  // Update message
  updateMessage: protectedProcedure
    .input(updateMessageSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify message ownership
      const existingMessage = await ctx.prisma.consultationMessage.findFirst({
        where: {
          id: input.id,
          senderId: ctx.session.user.id,
        },
      })

      if (!existingMessage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        })
      }

      const message = await ctx.prisma.consultationMessage.update({
        where: { id: input.id },
        data: {
          content: input.content,
          isEdited: true,
          editedAt: new Date(),
        },
      })

      return { message, success: true }
    }),

  // Delete message
  deleteMessage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify message ownership
      const message = await ctx.prisma.consultationMessage.findFirst({
        where: {
          id: input.id,
          senderId: ctx.session.user.id,
        },
      })

      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        })
      }

      await ctx.prisma.consultationMessage.update({
        where: { id: input.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      })

      return { success: true, message: "Message deleted" }
    }),

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  // Create document
  createDocument: protectedProcedure
    .input(createDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify room access
      const room = await ctx.prisma.consultationRoom.findFirst({
        where: {
          id: input.roomId,
          OR: [
            { clientId: ctx.session.user.id },
            { consultantId: ctx.session.user.id },
          ],
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      const document = await ctx.prisma.consultationDocument.create({
        data: {
          ...input,
          uploadedBy: ctx.session.user.id,
        } as any,
        include: {
          uploader: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      return { document, message: "Document created successfully" }
    }),

  // Get room documents
  getRoomDocuments: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify room access
      const room = await ctx.prisma.consultationRoom.findFirst({
        where: {
          id: input.roomId,
          OR: [
            { clientId: ctx.session.user.id },
            { consultantId: ctx.session.user.id },
          ],
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      const documents = await ctx.prisma.consultationDocument.findMany({
        where: { roomId: input.roomId },
        orderBy: { updatedAt: "desc" },
        include: {
          uploader: {
            select: {
              name: true,
              email: true,
            },
          },
          versions: {
            orderBy: { createdAt: "desc" },
            take: 3, // Only show last 3 versions
            include: {
              creator: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      return documents
    }),

  // Update document
  updateDocument: protectedProcedure
    .input(updateDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify document access
      const existingDocument = await ctx.prisma.consultationDocument.findFirst({
        where: {
          id,
          room: {
            OR: [
              { clientId: ctx.session.user.id },
              { consultantId: ctx.session.user.id },
            ],
          },
        },
        include: {
          room: true,
        },
      })

      if (!existingDocument) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        })
      }

      // Create version if content changed
      if (input.content && input.content !== existingDocument.content) {
        await ctx.prisma.documentVersion.create({
          data: {
            documentId: id,
            content: existingDocument.content || "",
            version: existingDocument.version,
            changeNote: "Updated via consultation room",
            createdBy: ctx.session.user.id,
          } as any,
        })

        Object.assign(updateData, { version: existingDocument.version + 1 })
      }

      const document = await ctx.prisma.consultationDocument.update({
        where: { id },
        data: updateData,
      })

      return { document, message: "Document updated successfully" }
    }),

  // ============================================================================
  // ACTION ITEMS
  // ============================================================================

  // Create action item
  createActionItem: protectedProcedure
    .input(createActionItemSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify room access
      const room = await ctx.prisma.consultationRoom.findFirst({
        where: {
          id: input.roomId,
          OR: [
            { clientId: ctx.session.user.id },
            { consultantId: ctx.session.user.id },
          ],
        },
      })

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        })
      }

      const actionItem = await ctx.prisma.consultationActionItem.create({
        data: {
          ...input,
          createdBy: ctx.session.user.id,
        } as any,
        include: {
          assignee: {
            select: {
              name: true,
              email: true,
            },
          },
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      return { actionItem, message: "Action item created successfully" }
    }),

  // Update action item
  updateActionItem: protectedProcedure
    .input(updateActionItemSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify action item access
      const existingActionItem = await ctx.prisma.consultationActionItem.findFirst({
        where: {
          id,
          room: {
            OR: [
              { clientId: ctx.session.user.id },
              { consultantId: ctx.session.user.id },
            ],
          },
        },
      })

      if (!existingActionItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Action item not found",
        })
      }

      // Set completion date if status is completed
      if (input.status === "completed") {
        (updateData as any).completedAt = new Date()
      }

      const actionItem = await ctx.prisma.consultationActionItem.update({
        where: { id },
        data: updateData,
      })

      return { actionItem, message: "Action item updated successfully" }
    }),

  // ============================================================================
  // DASHBOARD & ANALYTICS
  // ============================================================================

  // Get consultation dashboard data
  getDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id

      const [
        upcomingConsultations,
        activeRooms,
        recentConsultations,
        consultationStats,
        roomStats
      ] = await Promise.all([
        // Upcoming consultations
        ctx.prisma.consultation.findMany({
          where: {
            userId,
            status: ConsultationStatus.SCHEDULED,
            scheduledAt: {
              gte: new Date(),
            },
          },
          orderBy: { scheduledAt: "asc" },
          take: 5,
          include: {
            project: {
              select: { title: true },
            },
          },
        }),
        
        // Active rooms
        ctx.prisma.consultationRoom.findMany({
          where: {
            OR: [
              { clientId: userId },
              { consultantId: userId },
            ],
            status: ConsultationRoomStatus.ACTIVE,
          },
          take: 5,
          include: {
            client: {
              select: { name: true, image: true },
            },
            consultant: {
              select: { name: true, image: true },
            },
          },
        }),

        // Recent consultations
        ctx.prisma.consultation.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
          take: 10,
          include: {
            project: {
              select: { title: true },
            },
          },
        }),

        // Consultation statistics
        ctx.prisma.consultation.groupBy({
          by: ['status'],
          where: { userId },
          _count: { status: true },
        }),

        // Room statistics
        ctx.prisma.consultationRoom.groupBy({
          by: ['status'],
          where: {
            OR: [
              { clientId: userId },
              { consultantId: userId },
            ],
          },
          _count: { status: true },
        }),
      ])

      const totalConsultations = consultationStats.reduce((sum, stat) => sum + stat._count.status, 0)
      const completedConsultations = consultationStats.find(s => s.status === ConsultationStatus.COMPLETED)?._count.status || 0
      const activeRoomsCount = roomStats.find(s => s.status === ConsultationRoomStatus.ACTIVE)?._count.status || 0

      return {
        upcomingConsultations,
        activeRooms,
        recentActivity: recentConsultations,
        statistics: {
          totalConsultations,
          completedConsultations,
          activeRooms: activeRoomsCount,
          completionRate: totalConsultations > 0 ? (completedConsultations / totalConsultations) * 100 : 0,
        },
      }
    }),
})