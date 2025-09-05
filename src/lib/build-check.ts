// Simple utility to check if we're in build mode
export const isBuildTime = () => {
  return process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === undefined;
};

export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};