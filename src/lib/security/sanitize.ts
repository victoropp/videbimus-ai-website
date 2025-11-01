import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window;
// @ts-ignore - jsdom's window is compatible with DOMPurify
const purify = DOMPurify(window);

/**
 * Sanitization configuration for different use cases
 */
export const SanitizeConfig = {
  /**
   * Strict sanitization - removes all HTML tags
   */
  strict: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },

  /**
   * Basic sanitization - allows safe HTML formatting
   */
  basic: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },

  /**
   * Rich text sanitization - allows more HTML but still safe
   */
  rich: {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
  },

  /**
   * Markdown-like sanitization - for chat messages
   */
  markdown: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'blockquote', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
  },
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(
  dirty: string,
  config: typeof SanitizeConfig[keyof typeof SanitizeConfig] = SanitizeConfig.basic
): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return purify.sanitize(dirty, config);
}

/**
 * Sanitize plain text input - removes all HTML and special characters
 */
export function sanitizePlainText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove all HTML tags
  let sanitized = purify.sanitize(input, SanitizeConfig.strict);

  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");

  return sanitized.trim();
}

/**
 * Sanitize user input for chat messages
 */
export function sanitizeChatMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return '';
  }

  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = message.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Limit consecutive newlines
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Sanitize HTML with markdown config
  sanitized = purify.sanitize(sanitized, SanitizeConfig.markdown);

  return sanitized.trim();
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Remove whitespace and convert to lowercase
  let sanitized = email.trim().toLowerCase();

  // Remove HTML tags
  sanitized = purify.sanitize(sanitized, SanitizeConfig.strict);

  // Validate basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  let sanitized = url.trim();

  // Remove HTML tags
  sanitized = purify.sanitize(sanitized, SanitizeConfig.strict);

  // Only allow http, https, and mailto protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:'];
  try {
    const urlObj = new URL(sanitized);
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '';
    }
    return sanitized;
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Remove potential PII (Personally Identifiable Information) from text
 */
export function removePII(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text;

  // Mask email addresses
  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    '[EMAIL_REDACTED]'
  );

  // Mask phone numbers (various formats)
  sanitized = sanitized.replace(
    /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    '[PHONE_REDACTED]'
  );

  // Mask SSN (US format)
  sanitized = sanitized.replace(
    /\b\d{3}-\d{2}-\d{4}\b/g,
    '[SSN_REDACTED]'
  );

  // Mask credit card numbers
  sanitized = sanitized.replace(
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    '[CARD_REDACTED]'
  );

  // Mask IP addresses
  sanitized = sanitized.replace(
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    '[IP_REDACTED]'
  );

  return sanitized;
}

/**
 * Detect potentially malicious content
 */
export function detectMaliciousContent(text: string): {
  isSafe: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (!text || typeof text !== 'string') {
    return { isSafe: true, reasons: [] };
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b).*(\bFROM\b|\bWHERE\b|\bTABLE\b)/i,
    /'\s*(OR|AND)\s*'?\d*'?\s*=\s*'?\d*/i,
    /--\s*$/m,
    /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(text)) {
      reasons.push('Potential SQL injection detected');
      break;
    }
  }

  // Check for XSS patterns
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=\s*["'][^"']*["']/i,
    /<iframe[\s\S]*?>/i,
    /<embed[\s\S]*?>/i,
    /<object[\s\S]*?>/i,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(text)) {
      reasons.push('Potential XSS attack detected');
      break;
    }
  }

  // Check for command injection
  const commandPatterns = [
    /[;&|`$()]/,
    /\.\.\//,
    /~\//,
  ];

  for (const pattern of commandPatterns) {
    if (pattern.test(text)) {
      reasons.push('Potential command injection detected');
      break;
    }
  }

  // Check for path traversal
  if (text.includes('../') || text.includes('..\\')) {
    reasons.push('Potential path traversal detected');
  }

  // Check for excessive length (potential DoS)
  if (text.length > 50000) {
    reasons.push('Content exceeds maximum length');
  }

  return {
    isSafe: reasons.length === 0,
    reasons,
  };
}

/**
 * Comprehensive input validation and sanitization
 */
export function validateAndSanitize(input: string, type: 'chat' | 'email' | 'url' | 'plain' = 'plain'): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for malicious content
  const maliciousCheck = detectMaliciousContent(input);
  if (!maliciousCheck.isSafe) {
    errors.push(...maliciousCheck.reasons);
    return {
      isValid: false,
      sanitized: '',
      errors,
    };
  }

  // Sanitize based on type
  let sanitized: string;
  switch (type) {
    case 'chat':
      sanitized = sanitizeChatMessage(input);
      break;
    case 'email':
      sanitized = sanitizeEmail(input);
      if (!sanitized) {
        errors.push('Invalid email format');
      }
      break;
    case 'url':
      sanitized = sanitizeUrl(input);
      if (!sanitized) {
        errors.push('Invalid URL format or protocol');
      }
      break;
    case 'plain':
    default:
      sanitized = sanitizePlainText(input);
      break;
  }

  // Validate sanitized output
  if (!sanitized) {
    errors.push('Input contains invalid or dangerous content');
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
}
