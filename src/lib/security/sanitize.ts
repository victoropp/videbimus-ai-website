// Pure regex-based sanitizer — no jsdom/DOMPurify dependency
// isomorphic-dompurify uses jsdom which requires parse5 (ESM), incompatible with Next.js serverless

function stripHtml(input: string, keepContent = true): string {
  if (keepContent) {
    return input.replace(/<[^>]*>/g, '');
  }
  return input.replace(/<[^>]*>[\s\S]*?<\/[^>]+>|<[^>]*\/>/g, '');
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';
  return stripHtml(dirty);
}

export function sanitizePlainText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return decodeHtmlEntities(stripHtml(input)).trim();
}

export function sanitizeChatMessage(message: string): string {
  if (!message || typeof message !== 'string') return '';
  let s = message.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  s = s.replace(/\n{3,}/g, '\n\n');
  s = stripHtml(s);
  return s.trim();
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const s = stripHtml(email).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : '';
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const s = stripHtml(url).trim();
  try {
    const u = new URL(s);
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? s : '';
  } catch {
    return '';
  }
}

export function removePII(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
    .replace(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE_REDACTED]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REDACTED]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_REDACTED]');
}

export function detectMaliciousContent(text: string): { isSafe: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!text || typeof text !== 'string') return { isSafe: true, reasons: [] };

  const sqlPatterns = [
    /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b).*(\bFROM\b|\bWHERE\b|\bTABLE\b)/i,
    /'\s*(OR|AND)\s*'?\d*'?\s*=\s*'?\d*/i,
    /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
  ];
  if (sqlPatterns.some(p => p.test(text))) reasons.push('Potential SQL injection detected');

  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=\s*["'][^"']*["']/i,
    /<iframe[\s\S]*?>/i,
  ];
  if (xssPatterns.some(p => p.test(text))) reasons.push('Potential XSS attack detected');

  if (text.includes('../') || text.includes('..\\')) reasons.push('Potential path traversal detected');
  if (text.length > 50000) reasons.push('Content exceeds maximum length');

  return { isSafe: reasons.length === 0, reasons };
}

export function validateAndSanitize(
  input: string,
  type: 'chat' | 'email' | 'url' | 'plain' = 'plain'
): { isValid: boolean; sanitized: string; errors: string[] } {
  const errors: string[] = [];

  const maliciousCheck = detectMaliciousContent(input);
  if (!maliciousCheck.isSafe) {
    errors.push(...maliciousCheck.reasons);
    return { isValid: false, sanitized: '', errors };
  }

  let sanitized: string;
  switch (type) {
    case 'chat':
      sanitized = sanitizeChatMessage(input);
      break;
    case 'email':
      sanitized = sanitizeEmail(input);
      if (!sanitized) errors.push('Invalid email format');
      break;
    case 'url':
      sanitized = sanitizeUrl(input);
      if (!sanitized) errors.push('Invalid URL format or protocol');
      break;
    default:
      sanitized = sanitizePlainText(input);
  }

  if (!sanitized) errors.push('Input contains invalid or dangerous content');

  return { isValid: errors.length === 0, sanitized, errors };
}

// Keep SanitizeConfig for backwards compat
export const SanitizeConfig = {
  strict: { ALLOWED_TAGS: [], ALLOWED_ATTR: [], KEEP_CONTENT: true },
  basic: { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'], ALLOWED_ATTR: [], KEEP_CONTENT: true },
  rich: { ALLOWED_TAGS: ['b', 'i', 'p', 'ul', 'li', 'a', 'code'], ALLOWED_ATTR: ['href'], KEEP_CONTENT: true },
  markdown: { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'a'], ALLOWED_ATTR: ['href'], KEEP_CONTENT: true },
};
