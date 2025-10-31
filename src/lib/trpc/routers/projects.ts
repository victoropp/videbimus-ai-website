import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure, consultantProcedure } from "../init"
import { ProjectStatus, Priority, TaskStatus } from "@prisma/client"

const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
})

const updateProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  budget: z.number().positive().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

const getProjectsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  search: z.string().optional(),
})

const createTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.date().optional(),
})

const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.date().optional(),
})

export const projectsRouter = createTRPCRouter({
  // Create a new project
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        } as any,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              consultations: true,
              files: true,
            },
          },
        } as any,
      })

      return { project, message: "Project created successfully" }
    }),

  // Get user's projects
  getAll: protectedProcedure
    .input(getProjectsSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, status, priority, search } = input
      const skip = (page - 1) * limit

      const where = {
        userId: ctx.session.user.id,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      }

      const [projects, total] = await Promise.all([
        ctx.prisma.project.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                tasks: true,
                consultations: true,
                files: true,
              },
            },
          },
        }),
        ctx.prisma.project.count({ where }),
      ])

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        } as any,
      }
    }),

  // Get project by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
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
          tasks: {
            orderBy: { createdAt: "desc" },
          },
          consultations: {
            orderBy: { scheduledAt: "desc" },
          },
          files: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              tasks: true,
              consultations: true,
              files: true,
            },
          },
        } as any,
      })

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        })
      }

      return project
    }),

  // Update project
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify ownership
      const existingProject = await ctx.prisma.project.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        } as any,
      })

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        })
      }

      const project = await ctx.prisma.project.update({
        where: { id },
        data: updateData as any,
        include: {
          _count: {
            select: {
              tasks: true,
              consultations: true,
              files: true,
            },
          },
        } as any,
      })

      return { project, message: "Project updated successfully" }
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        } as any,
      })

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        })
      }

      await ctx.prisma.project.delete({
        where: { id: input.id },
      })

      return { message: "Project deleted successfully" }
    }),

  // Task management
  createTask: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        } as any,
      })

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        })
      }

      const task = await ctx.prisma.task.create({
        data: input as any,
      })

      return { task, message: "Task created successfully" }
    }),

  updateTask: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify task belongs to user's project
      const task = await ctx.prisma.task.findFirst({
        where: {
          id,
          project: {
            userId: ctx.session.user.id,
          },
        } as any,
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      const updatedTask = await ctx.prisma.task.update({
        where: { id },
        data: {
          ...updateData,
          ...(input.status === TaskStatus.COMPLETED && {
            completedAt: new Date(),
          }),
        } as any,
      })

      return { task: updatedTask, message: "Task updated successfully" }
    }),

  deleteTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify task belongs to user's project
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        } as any,
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      await ctx.prisma.task.delete({
        where: { id: input.id },
      })

      return { message: "Task deleted successfully" }
    }),

  // Get all projects for consultants/admins
  getAllForConsultant: consultantProcedure
    .input(getProjectsSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, status, priority, search } = input
      const skip = (page - 1) * limit

      const where = {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
      }

      const [projects, total] = await Promise.all([
        ctx.prisma.project.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            _count: {
              select: {
                tasks: true,
                consultations: true,
                files: true,
              },
            },
          },
        }),
        ctx.prisma.project.count({ where }),
      ])

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        } as any,
      }
    }),
})