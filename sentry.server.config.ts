import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Performance monitoring
  integrations: [
    new Sentry.NodeTracingIntegration(),
    new Sentry.ProfilingIntegration(),
  ],
  
  // Profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release information
  release: process.env.APP_VERSION,
  
  // Filter out errors we don't want to track
  beforeSend(event) {
    // Log all errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error:', event);
      return event;
    }
    
    // Filter out known issues in production
    if (event.exception) {
      const error = event.exception.values?.[0];
      
      // Filter out database connection errors during deployment
      if (error?.type === 'PrismaClientInitializationError') {
        return null;
      }
      
      // Filter out rate limiting errors (these are expected)
      if (error?.value?.includes('Too Many Requests')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Custom error tags
  initialScope: {
    tags: {
      component: 'server',
    },
  },
  
  // Custom context
  beforeBreadcrumb(breadcrumb) {
    // Don't log sensitive data in breadcrumbs
    if (breadcrumb.category === 'http' && breadcrumb.data?.url) {
      // Remove sensitive query parameters
      const url = new URL(breadcrumb.data.url, 'http://localhost');
      url.searchParams.delete('token');
      url.searchParams.delete('password');
      url.searchParams.delete('secret');
      breadcrumb.data.url = url.toString();
    }
    
    return breadcrumb;
  },
});