/**
 * Application configuration management
 * @fileoverview Centralized configuration management with environment validation
 */

import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // AI Services
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  HUGGINGFACE_API_KEY: z.string().min(1).optional(),
  
  // Vector Database
  PINECONE_API_KEY: z.string().min(1).optional(),
  PINECONE_ENVIRONMENT: z.string().min(1).optional(),
  PINECONE_INDEX_NAME: z.string().min(1).optional(),
  
  // Email
  RESEND_API_KEY: z.string().min(1).optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // Analytics
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // File Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Collaboration
  DAILY_API_KEY: z.string().optional(),
  DAILY_DOMAIN: z.string().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().optional(),
  NEXT_PUBLIC_ENABLE_DARK_MODE: z.string().optional(),
  NEXT_PUBLIC_ENABLE_COLLABORATION: z.string().optional(),
  NEXT_PUBLIC_ENABLE_AI_SHOWCASE: z.string().optional(),
  NEXT_PUBLIC_ENABLE_BLOG: z.string().optional(),
  NEXT_PUBLIC_ENABLE_NEWSLETTER: z.string().optional(),
});

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  }
}

const env = parseEnv();

// Application Configuration
export const config = {
  // Environment
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // Application
  app: {
    name: 'Videbimus AI',
    url: env.NEXT_PUBLIC_APP_URL,
    description: 'Expert AI and Data Science consulting services',
    version: process.env.npm_package_version || '1.0.0',
  },
  
  // Database
  database: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  },
  
  // Authentication
  auth: {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
  },
  
  // AI Services
  ai: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
      models: {
        gpt4: 'gpt-4-1106-preview',
        gpt35: 'gpt-3.5-turbo-1106',
        embedding: 'text-embedding-3-small',
        dalle: 'dall-e-3',
      },
    },
    anthropic: {
      apiKey: env.ANTHROPIC_API_KEY,
      models: {
        opus: 'claude-3-opus-20240229',
        sonnet: 'claude-3-sonnet-20240229',
        haiku: 'claude-3-haiku-20240307',
      },
    },
    huggingface: {
      apiKey: env.HUGGINGFACE_API_KEY,
    },
  },
  
  // Vector Database
  vectorDb: {
    pinecone: {
      apiKey: env.PINECONE_API_KEY,
      environment: env.PINECONE_ENVIRONMENT,
      indexName: env.PINECONE_INDEX_NAME || 'videbimus-ai',
    },
  },
  
  // Email
  email: {
    resend: {
      apiKey: env.RESEND_API_KEY,
      fromAddress: 'hello@videbimusai.com',
      replyToAddress: 'hello@videbimusai.com',
    },
    smtp: {
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587', 10),
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
    },
  },
  
  // Analytics
  analytics: {
    google: {
      measurementId: env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    },
    posthog: {
      apiKey: env.NEXT_PUBLIC_POSTHOG_KEY,
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
    },
  },
  
  // Monitoring
  monitoring: {
    sentry: {
      dsn: env.SENTRY_DSN,
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
    },
  },
  
  // Redis
  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT || '6379', 10),
    password: env.REDIS_PASSWORD,
  },
  
  // File Storage
  storage: {
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION || 'us-east-1',
      bucket: env.AWS_S3_BUCKET,
    },
  },
  
  // Collaboration
  collaboration: {
    daily: {
      apiKey: env.DAILY_API_KEY,
      domain: env.DAILY_DOMAIN,
    },
  },
  
  // Feature Flags
  features: {
    analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    darkMode: env.NEXT_PUBLIC_ENABLE_DARK_MODE !== 'false',
    collaboration: env.NEXT_PUBLIC_ENABLE_COLLABORATION === 'true',
    aiShowcase: env.NEXT_PUBLIC_ENABLE_AI_SHOWCASE !== 'false',
    blog: env.NEXT_PUBLIC_ENABLE_BLOG !== 'false',
    newsletter: env.NEXT_PUBLIC_ENABLE_NEWSLETTER !== 'false',
  },
  
  // Rate Limiting
  rateLimit: {
    api: {
      requests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    ai: {
      requests: 10,
      windowMs: 60 * 1000, // 1 minute
    },
    contact: {
      requests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    },
  },
  
  // File Upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/json',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  
  // Session
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    updateAge: 24 * 60 * 60, // 1 day in seconds
  },
  
  // API Timeouts
  timeouts: {
    ai: 30000, // 30 seconds
    database: 10000, // 10 seconds
    email: 15000, // 15 seconds
    upload: 60000, // 1 minute
  },
} as const;

// Export environment type
export type Environment = typeof env;
export type Config = typeof config;

// Validation helpers
export const validateRequiredEnvVars = (vars: (keyof Environment)[]) => {
  const missing = vars.filter(key => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Configuration getters with validation
export const getAIConfig = () => {
  const requiredVars: (keyof Environment)[] = ['OPENAI_API_KEY'];
  validateRequiredEnvVars(requiredVars);
  return config.ai;
};

export const getDatabaseConfig = () => {
  const requiredVars: (keyof Environment)[] = ['DATABASE_URL'];
  validateRequiredEnvVars(requiredVars);
  return config.database;
};

export const getEmailConfig = () => {
  const requiredVars: (keyof Environment)[] = ['RESEND_API_KEY'];
  validateRequiredEnvVars(requiredVars);
  return config.email;
};

export const getAuthConfig = () => {
  const requiredVars: (keyof Environment)[] = ['NEXTAUTH_SECRET'];
  validateRequiredEnvVars(requiredVars);
  return config.auth;
};

// Runtime configuration checks
if (config.isDev) {
  console.log('🔧 Development mode enabled');
  console.log(`🌐 App URL: ${config.app.url}`);
  console.log(`🚀 Features enabled:`, Object.entries(config.features).filter(([, enabled]) => enabled).map(([name]) => name));
}

export default config;