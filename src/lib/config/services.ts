import { z } from 'zod';

// Service Configuration Schemas
export const serviceConfigSchema = z.object({
  // Environment
  nodeEnv: z.enum(['development', 'staging', 'production']).default('development'),
  appUrl: z.string().url(),
  appVersion: z.string().default('1.0.0'),
  
  // Database
  database: z.object({
    url: z.string(),
    maxConnections: z.number().default(100),
    ssl: z.boolean().default(true),
  }),
  
  // Redis Cache
  redis: z.object({
    url: z.string(),
    password: z.string().optional(),
    maxRetries: z.number().default(3),
    retryDelay: z.number().default(1000),
    tls: z.boolean().default(true),
  }),
  
  // AI Services
  ai: z.object({
    openai: z.object({
      apiKey: z.string(),
      baseUrl: z.string().optional(),
      organization: z.string().optional(),
      timeout: z.number().default(60000),
      maxRetries: z.number().default(3),
      defaultModel: z.string().default('gpt-4o-mini'),
    }),
    anthropic: z.object({
      apiKey: z.string(),
      baseUrl: z.string().optional(),
      timeout: z.number().default(60000),
      maxRetries: z.number().default(3),
      defaultModel: z.string().default('claude-3-5-sonnet-20241022'),
    }),
    huggingface: z.object({
      apiKey: z.string(),
      timeout: z.number().default(60000),
      maxRetries: z.number().default(3),
    }),
  }),
  
  // Vector Database
  pinecone: z.object({
    apiKey: z.string(),
    environment: z.string(),
    index: z.string().default('videbimus-knowledge'),
    timeout: z.number().default(30000),
    maxRetries: z.number().default(3),
  }),
  
  // Email Service
  email: z.object({
    resend: z.object({
      apiKey: z.string(),
      fromEmail: z.string().email(),
      timeout: z.number().default(30000),
      maxRetries: z.number().default(3),
    }),
    smtp: z.object({
      host: z.string().optional(),
      port: z.number().optional(),
      secure: z.boolean().default(true),
      user: z.string().optional(),
      password: z.string().optional(),
    }).optional(),
  }),
  
  // File Storage
  storage: z.object({
    aws: z.object({
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
      region: z.string().default('us-east-1'),
      bucket: z.string(),
      cdnUrl: z.string().optional(),
      timeout: z.number().default(30000),
      maxFileSize: z.number().default(10 * 1024 * 1024), // 10MB
    }),
  }),
  
  // Video Conferencing
  video: z.object({
    daily: z.object({
      apiKey: z.string(),
      domain: z.string().optional(),
      timeout: z.number().default(30000),
      maxRetries: z.number().default(3),
    }),
  }),
  
  // Analytics & Monitoring
  analytics: z.object({
    sentry: z.object({
      dsn: z.string(),
      environment: z.string(),
      tracesSampleRate: z.number().min(0).max(1).default(0.1),
      profilesSampleRate: z.number().min(0).max(1).default(0.1),
      enabled: z.boolean().default(true),
    }),
    googleAnalytics: z.object({
      measurementId: z.string().optional(),
      enabled: z.boolean().default(false),
    }).optional(),
    customTracking: z.object({
      enabled: z.boolean().default(true),
      endpoint: z.string().optional(),
    }),
  }),
  
  // Authentication
  auth: z.object({
    nextAuthSecret: z.string(),
    nextAuthUrl: z.string().url(),
    providers: z.object({
      google: z.object({
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        enabled: z.boolean().default(false),
      }),
      github: z.object({
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        enabled: z.boolean().default(false),
      }),
    }),
  }),
  
  // CRM Integration
  crm: z.object({
    hubspot: z.object({
      accessToken: z.string().optional(),
      portalId: z.string().optional(),
      enabled: z.boolean().default(false),
    }),
    salesforce: z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      securityToken: z.string().optional(),
      enabled: z.boolean().default(false),
    }),
  }),
  
  // Calendar Integration
  calendar: z.object({
    google: z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      enabled: z.boolean().default(false),
    }),
    outlook: z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      enabled: z.boolean().default(false),
    }),
  }),
  
  // Security
  security: z.object({
    encryptionKey: z.string(),
    backupEncryptionKey: z.string().optional(),
    corsOrigins: z.array(z.string()).default([]),
    rateLimiting: z.object({
      maxRequests: z.number().default(100),
      windowMs: z.number().default(15 * 60 * 1000), // 15 minutes
      enabled: z.boolean().default(true),
    }),
  }),
  
  // Feature Flags
  features: z.object({
    analytics: z.boolean().default(true),
    newsletter: z.boolean().default(true),
    blog: z.boolean().default(true),
    consultations: z.boolean().default(true),
    fileUpload: z.boolean().default(true),
    emailNotifications: z.boolean().default(true),
    videoConferencing: z.boolean().default(true),
    aiChat: z.boolean().default(true),
    aiDemos: z.boolean().default(true),
    collaboration: z.boolean().default(true),
  }),
});

export type ServiceConfig = z.infer<typeof serviceConfigSchema>;

// Load configuration from environment variables
export function loadServiceConfig(): ServiceConfig {
  const config = {
    nodeEnv: process.env.NODE_ENV as 'development' | 'staging' | 'production',
    appUrl: process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
    appVersion: process.env.APP_VERSION || '1.0.0',
    
    database: {
      url: process.env.DATABASE_URL!,
      maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '100'),
      ssl: process.env.DATABASE_SSL !== 'false',
    },
    
    redis: {
      url: process.env.REDIS_URL!,
      password: process.env.REDIS_PASSWORD,
      maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
      tls: process.env.REDIS_TLS !== 'false',
    },
    
    ai: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY!,
        baseUrl: process.env.OPENAI_BASE_URL,
        organization: process.env.OPENAI_ORGANIZATION,
        timeout: parseInt(process.env.OPENAI_TIMEOUT || '60000'),
        maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES || '3'),
        defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY!,
        baseUrl: process.env.ANTHROPIC_BASE_URL,
        timeout: parseInt(process.env.ANTHROPIC_TIMEOUT || '60000'),
        maxRetries: parseInt(process.env.ANTHROPIC_MAX_RETRIES || '3'),
        defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
      },
      huggingface: {
        apiKey: process.env.HUGGINGFACE_API_KEY!,
        timeout: parseInt(process.env.HUGGINGFACE_TIMEOUT || '60000'),
        maxRetries: parseInt(process.env.HUGGINGFACE_MAX_RETRIES || '3'),
      },
    },
    
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
      index: process.env.PINECONE_INDEX || 'videbimus-knowledge',
      timeout: parseInt(process.env.PINECONE_TIMEOUT || '30000'),
      maxRetries: parseInt(process.env.PINECONE_MAX_RETRIES || '3'),
    },
    
    email: {
      resend: {
        apiKey: process.env.RESEND_API_KEY!,
        fromEmail: process.env.FROM_EMAIL || 'noreply@videbimusai.com',
        timeout: parseInt(process.env.RESEND_TIMEOUT || '30000'),
        maxRetries: parseInt(process.env.RESEND_MAX_RETRIES || '3'),
      },
      smtp: process.env.SMTP_HOST ? {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
      } : undefined,
    },
    
    storage: {
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET!,
        cdnUrl: process.env.AWS_CLOUDFRONT_URL,
        timeout: parseInt(process.env.AWS_TIMEOUT || '30000'),
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
      },
    },
    
    video: {
      daily: {
        apiKey: process.env.DAILY_API_KEY!,
        domain: process.env.DAILY_DOMAIN,
        timeout: parseInt(process.env.DAILY_TIMEOUT || '30000'),
        maxRetries: parseInt(process.env.DAILY_MAX_RETRIES || '3'),
      },
    },
    
    analytics: {
      sentry: {
        dsn: process.env.SENTRY_DSN!,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
        profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
        enabled: process.env.SENTRY_ENABLED !== 'false',
      },
      googleAnalytics: process.env.GA_MEASUREMENT_ID ? {
        measurementId: process.env.GA_MEASUREMENT_ID,
        enabled: process.env.GA_ENABLED !== 'false',
      } : undefined,
      customTracking: {
        enabled: process.env.CUSTOM_TRACKING_ENABLED !== 'false',
        endpoint: process.env.CUSTOM_TRACKING_ENDPOINT,
      },
    },
    
    auth: {
      nextAuthSecret: process.env.NEXTAUTH_SECRET!,
      nextAuthUrl: process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000',
      providers: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        },
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        },
      },
    },
    
    crm: {
      hubspot: {
        accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
        portalId: process.env.HUBSPOT_PORTAL_ID,
        enabled: !!(process.env.HUBSPOT_ACCESS_TOKEN && process.env.HUBSPOT_PORTAL_ID),
      },
      salesforce: {
        clientId: process.env.SALESFORCE_CLIENT_ID,
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        username: process.env.SALESFORCE_USERNAME,
        password: process.env.SALESFORCE_PASSWORD,
        securityToken: process.env.SALESFORCE_SECURITY_TOKEN,
        enabled: !!(process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_CLIENT_SECRET),
      },
    },
    
    calendar: {
      google: {
        clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        enabled: !!(process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET),
      },
      outlook: {
        clientId: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        enabled: !!(process.env.OUTLOOK_CLIENT_ID && process.env.OUTLOOK_CLIENT_SECRET),
      },
    },
    
    security: {
      encryptionKey: process.env.ENCRYPTION_KEY!,
      backupEncryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || [],
      rateLimiting: {
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
      },
    },
    
    features: {
      analytics: process.env.ENABLE_ANALYTICS !== 'false',
      newsletter: process.env.ENABLE_NEWSLETTER !== 'false',
      blog: process.env.ENABLE_BLOG !== 'false',
      consultations: process.env.ENABLE_CONSULTATIONS !== 'false',
      fileUpload: process.env.ENABLE_FILE_UPLOAD !== 'false',
      emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
      videoConferencing: process.env.ENABLE_VIDEO_CONFERENCING !== 'false',
      aiChat: process.env.ENABLE_AI_CHAT !== 'false',
      aiDemos: process.env.ENABLE_AI_DEMOS !== 'false',
      collaboration: process.env.ENABLE_COLLABORATION !== 'false',
    },
  };
  
  return serviceConfigSchema.parse(config);
}

// Cached configuration instance
let cachedConfig: ServiceConfig | null = null;

export function getServiceConfig(): ServiceConfig {
  if (!cachedConfig) {
    cachedConfig = loadServiceConfig();
  }
  return cachedConfig;
}

// Helper functions for specific service configurations
export function getAIConfig() {
  return getServiceConfig().ai;
}

export function getDatabaseConfig() {
  return getServiceConfig().database;
}

export function getRedisConfig() {
  return getServiceConfig().redis;
}

export function getEmailConfig() {
  return getServiceConfig().email;
}

export function getStorageConfig() {
  return getServiceConfig().storage;
}

export function getAnalyticsConfig() {
  return getServiceConfig().analytics;
}

export function getAuthConfig() {
  return getServiceConfig().auth;
}

export function getSecurityConfig() {
  return getServiceConfig().security;
}

export function getFeatureFlags() {
  return getServiceConfig().features;
}

// Environment-specific configurations
export const isProduction = () => getServiceConfig().nodeEnv === 'production';
export const isDevelopment = () => getServiceConfig().nodeEnv === 'development';
export const isStaging = () => getServiceConfig().nodeEnv === 'staging';
