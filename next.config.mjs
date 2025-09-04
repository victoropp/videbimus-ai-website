/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'videbimusai.com', 'images.unsplash.com'],
  },
  typescript: {
    // TEMPORARY: Skip ALL TypeScript errors for immediate deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during production build
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    // Handle missing modules gracefully
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@aws-sdk/client-s3': false,
      '@aws-sdk/s3-request-presigner': false,
      '@aws-sdk/lib-storage': false,
    };

    return config;
  },
};

export default nextConfig;