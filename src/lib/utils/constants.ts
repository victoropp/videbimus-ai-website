// Application constants
export const APP_NAME = "Videbimus AI"
export const APP_DESCRIPTION = "Your AI Consulting Partner"
export const APP_URL = process.env.APP_URL || "http://localhost:3000"

// File upload constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export const IMAGE_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]

// Rate limiting constants
export const RATE_LIMITS = {
  API_GENERAL: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  AUTH: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  CONTACT: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  NEWSLETTER: { requests: 5, windowMs: 60 * 60 * 1000 }, // 5 requests per hour
  UPLOAD: { requests: 10, windowMs: 10 * 60 * 1000 }, // 10 requests per 10 minutes
}

// Database constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
}

// User roles and permissions
export const USER_ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
  CONSULTANT: "CONSULTANT",
  GUEST: "GUEST",
} as const

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    "manage_users",
    "manage_projects",
    "manage_consultations",
    "manage_blog",
    "view_analytics",
    "manage_settings",
    "manage_contacts",
    "manage_newsletters",
  ],
  [USER_ROLES.CONSULTANT]: [
    "view_projects",
    "manage_consultations",
    "create_blog",
    "view_contacts",
  ],
  [USER_ROLES.CLIENT]: [
    "manage_own_projects",
    "view_own_consultations",
    "upload_files",
  ],
  [USER_ROLES.GUEST]: [
    "view_public_content",
  ],
}

// Project and task statuses
export const PROJECT_STATUSES = {
  PLANNING: "PLANNING",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export const TASK_STATUSES = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export const CONSULTATION_STATUSES = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  RESCHEDULED: "RESCHEDULED",
} as const

export const CONSULTATION_TYPES = {
  DISCOVERY: "DISCOVERY",
  STRATEGY: "STRATEGY",
  TECHNICAL: "TECHNICAL",
  REVIEW: "REVIEW",
  TRAINING: "TRAINING",
  FOLLOW_UP: "FOLLOW_UP",
} as const

export const PRIORITIES = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const

// Contact and newsletter statuses
export const CONTACT_STATUSES = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  RESPONDED: "RESPONDED",
  CLOSED: "CLOSED",
  SPAM: "SPAM",
} as const

export const NEWSLETTER_STATUSES = {
  SUBSCRIBED: "SUBSCRIBED",
  UNSUBSCRIBED: "UNSUBSCRIBED",
  BOUNCED: "BOUNCED",
  COMPLAINED: "COMPLAINED",
} as const

// Blog post statuses
export const POST_STATUSES = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const

// Email templates
export const EMAIL_TEMPLATES = {
  CONTACT_NOTIFICATION: "contact-notification",
  WELCOME: "welcome",
  PASSWORD_RESET: "password-reset",
  PROJECT_UPDATE: "project-update",
  CONSULTATION_REMINDER: "consultation-reminder",
}

// Analytics events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "page_view",
  CONTACT_SUBMIT: "contact_form_submit",
  NEWSLETTER_SIGNUP: "newsletter_signup",
  BLOG_VIEW: "blog_post_view",
  SERVICE_VIEW: "service_page_view",
  CASE_STUDY_VIEW: "case_study_view",
  DOWNLOAD: "file_download",
  LOGIN: "user_login",
  LOGOUT: "user_logout",
  REGISTRATION: "user_registration",
  PROJECT_CREATED: "project_created",
  CONSULTATION_BOOKED: "consultation_booked",
}

// UI Constants
export const THEME_COLORS = {
  PRIMARY: "#0066cc",
  SECONDARY: "#28a745",
  ACCENT: "#ff6b35",
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
  ERROR: "#ef4444",
  INFO: "#3b82f6",
}

export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
}

// Feature flags
export const FEATURES = {
  ANALYTICS: process.env.ENABLE_ANALYTICS === "true",
  NEWSLETTER: process.env.ENABLE_NEWSLETTER === "true",
  BLOG: process.env.ENABLE_BLOG === "true",
  CONSULTATIONS: process.env.ENABLE_CONSULTATIONS === "true",
  FILE_UPLOAD: process.env.ENABLE_FILE_UPLOAD !== "false",
  EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false",
}

// External service URLs
export const EXTERNAL_URLS = {
  LINKEDIN: "https://linkedin.com/company/videbimus-ai",
  TWITTER: "https://twitter.com/videbimus_ai",
  GITHUB: "https://github.com/videbimus-ai",
  PRIVACY_POLICY: "/privacy",
  TERMS_OF_SERVICE: "/terms",
  COOKIE_POLICY: "/cookies",
}

// SEO constants
export const SEO_DEFAULTS = {
  TITLE: "Videbimus AI - Your AI Consulting Partner",
  DESCRIPTION: "Transform your business with AI. Expert consulting, custom solutions, and strategic guidance for successful AI implementation.",
  KEYWORDS: "AI consulting, artificial intelligence, machine learning, business transformation, AI strategy",
  AUTHOR: "Videbimus AI",
  TYPE: "website",
  LOCALE: "en_US",
  SITE_NAME: "Videbimus AI",
}