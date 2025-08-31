import { z } from "zod"
import { hash } from "bcryptjs"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init"
import { UserRole } from "@prisma/client"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, email, password } = input

      // Check if user already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists with this email",
        })
      }

      // Hash password
      const hashedPassword = await hash(password, 12)

      // Create user
      const user = await ctx.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: UserRole.CLIENT,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      return { user, message: "User created successfully" }
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    return user
  }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      
      // If email is being updated, check if it's already taken
      if (input.email) {
        const existingUser = await ctx.prisma.user.findFirst({
          where: {
            email: input.email,
            NOT: { id: userId },
          },
        })

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use by another user",
          })
        }
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: userId },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          updatedAt: true,
        },
      })

      return { user: updatedUser, message: "Profile updated successfully" }
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { currentPassword, newPassword } = input

      // Get current user with password
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      })

      if (!user || !user.password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found or password not set",
        })
      }

      // Verify current password
      const isValidPassword = await hash(currentPassword, 12) === user.password
      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        })
      }

      // Hash new password and update
      const hashedNewPassword = await hash(newPassword, 12)
      await ctx.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      })

      return { message: "Password changed successfully" }
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Delete user account (cascade will handle related records)
    await ctx.prisma.user.delete({
      where: { id: userId },
    })

    return { message: "Account deleted successfully" }
  }),
})