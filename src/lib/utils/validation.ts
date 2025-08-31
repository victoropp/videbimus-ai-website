import { z } from "zod"

// Common validation schemas
export const emailSchema = z.string().email("Invalid email address")
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters")
export const nameSchema = z.string().min(2, "Name must be at least 2 characters")
export const phoneSchema = z.string().regex(/^[+]?[\d\s\-()]+$/, "Invalid phone number")

// Contact form validation
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  company: z.string().optional(),
  phone: phoneSchema.optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

// Newsletter subscription validation
export const newsletterSchema = z.object({
  email: emailSchema,
})

// User registration validation
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

// Project validation
export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  budget: z.number().positive("Budget must be positive").optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

// Task validation
export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  projectId: z.string().optional(),
  consultationId: z.string().optional(),
})

// Blog post validation
export const blogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  excerpt: z.string().optional(),
  content: z.string().min(50, "Content must be at least 50 characters"),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

// Consultation validation
export const consultationSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(480, "Duration cannot exceed 8 hours"),
  scheduledAt: z.date().min(new Date(), "Consultation must be scheduled in the future"),
})

// Validation helper functions
export function validateRequired<T>(value: T, fieldName: string): T {
  if (value === null || value === undefined || value === "") {
    throw new Error(`${fieldName} is required`)
  }
  return value
}

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

export function validateImageDimensions(
  file: File, 
  maxWidth: number, 
  maxHeight: number
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(true) // Not an image, skip dimension validation
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img.width <= maxWidth && img.height <= maxHeight)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }
    
    img.src = url
  })
}