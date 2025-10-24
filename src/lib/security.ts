import { NextRequest } from "next/server"
import { headers } from "next/headers"

/**
 * Validates that all critical environment variables are set
 * Throws error if any required variable is missing
 */
export function validateCriticalEnvVars(): void {
  const criticalVars = [
    'NEXTAUTH_SECRET',
    'ENCRYPTION_KEY',
  ]

  const missingVars: string[] = []

  for (const varName of criticalVars) {
    if (!process.env[varName] || process.env[varName]?.trim() === '') {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Critical environment variables are missing or empty: ${missingVars.join(', ')}. ` +
      'Application cannot start without these variables properly configured.'
    )
  }
}

// CSRF Token generation and validation
export function generateCSRFToken(): string {
  // Use crypto.getRandomValues() for cryptographically secure random values
  const array = new Uint8Array(32)

  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else if (typeof global !== 'undefined' && global.crypto) {
    global.crypto.getRandomValues(array)
  } else {
    // No fallback - throw error if crypto is not available
    throw new Error('Web Crypto API is not available. Cannot generate secure CSRF token.')
  }

  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function validateCSRFToken(token: string, sessionToken: string): Promise<boolean> {
  if (!token || !sessionToken) return false

  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(sessionToken)

    // Validate that NEXTAUTH_SECRET is set
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error('NEXTAUTH_SECRET environment variable is required but not set')
    }

    const keyData = encoder.encode(process.env.NEXTAUTH_SECRET)
    
    // Import key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    // Generate HMAC
    const signature = await crypto.subtle.sign('HMAC', key, data)
    const expectedToken = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return token === expectedToken
  } catch {
    return false
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return ""
  
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .trim()
    .slice(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const cleaned = email.toLowerCase().trim()
  
  return emailRegex.test(cleaned) ? cleaned : null
}

// Content Security Policy
export function getCSPHeader(): string {
  const array = new Uint8Array(16)
  if (typeof global !== 'undefined' && global.crypto) {
    global.crypto.getRandomValues(array)
  } else if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  }
  const nonce = btoa(String.fromCharCode(...array))
  
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.resend.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")
}

// Security headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": getCSPHeader(),
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-XSS-Protection": "1; mode=block",
  }
}

// Request validation
export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin")
  const allowedOrigins = [
    process.env.APP_URL,
    "http://localhost:3000",
    "https://localhost:3000",
  ].filter(Boolean)
  
  if (!origin) return true // Allow same-origin requests
  
  return allowedOrigins.includes(origin)
}

export function validateContentType(req: NextRequest, expectedType: string): boolean {
  const contentType = req.headers.get("content-type")
  return contentType?.includes(expectedType) ?? false
}

// File upload security
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes
}

export function generateSecureFilename(originalName: string): string {
  const ext = originalName.split(".").pop() || ""
  const timestamp = Date.now()
  
  const array = new Uint8Array(8)
  if (typeof global !== 'undefined' && global.crypto) {
    global.crypto.getRandomValues(array)
  } else if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  }
  const random = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  
  return `${timestamp}-${random}.${ext}`
}

// Data encryption/decryption using Web Crypto API
export async function encrypt(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)

  // Generate IV
  const iv = new Uint8Array(12)
  crypto.getRandomValues(iv)

  // Validate that ENCRYPTION_KEY is set
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required but not set')
  }

  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(process.env.ENCRYPTION_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  )
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined))
}

export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()

    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    // Validate that ENCRYPTION_KEY is set
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is required but not set')
    }

    // Derive key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(process.env.ENCRYPTION_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encrypted
    )
    
    return decoder.decode(decrypted)
  } catch {
    throw new Error('Decryption failed')
  }
}

// Password hashing utilities (additional to bcrypt)
export function generateSecurePassword(): string {
  const length = 16
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  
  const array = new Uint8Array(length)
  if (typeof global !== 'undefined' && global.crypto) {
    global.crypto.getRandomValues(array)
  } else if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  }
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(array[i] % charset.length)
  }
  
  return password
}

export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Audit logging
export function logSecurityEvent(event: {
  type: "login" | "logout" | "failed_login" | "password_change" | "suspicious_activity"
  userId?: string
  ip: string
  userAgent: string
  details?: Record<string, any>
}) {
  console.log(`[SECURITY] ${event.type}:`, {
    timestamp: new Date().toISOString(),
    ...event,
  })
  
  // In production, you'd want to send this to a proper logging service
  // like DataDog, Sentry, or store in a dedicated audit log table
}

// Request fingerprinting for suspicious activity detection
export async function generateRequestFingerprint(req: NextRequest): Promise<string> {
  const userAgent = req.headers.get("user-agent") || ""
  const acceptLanguage = req.headers.get("accept-language") || ""
  const acceptEncoding = req.headers.get("accept-encoding") || ""
  
  const encoder = new TextEncoder()
  const data = encoder.encode(userAgent + acceptLanguage + acceptEncoding)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return fingerprint.slice(0, 16)
}