import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Performance monitoring
  integrations: [
    new Sentry.BrowserTracing({
      // Set sampling rate for performance monitoring
      tracingOrigins: ['localhost', process.env.NEXT_PUBLIC_APP_URL || 'https://vidibemus.ai'],
    }),
    new Sentry.Replay({
      // Capture 10% of all sessions in production
      sessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
      // Capture 100% of sessions with an error
      errorSampleRate: 1.0,
    }),
  ],
  
  // Capture Console errors
  captureConsoleErrors: true,
  
  // Session replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release information
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Filter out errors we don't want to track
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return event;
    }
    
    // Filter out known issues
    if (event.exception) {
      const error = event.exception.values?.[0];
      
      // Filter out network errors that are not actionable
      if (error?.type === 'ChunkLoadError') {
        return null;
      }
      
      // Filter out common browser extension errors
      if (error?.value?.includes('Non-Error promise rejection captured')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Custom error tags
  initialScope: {
    tags: {
      component: 'client',
    },
  },
});