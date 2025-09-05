/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  trailingSlash: false,
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    // Suppress the specific Prisma instrumentation warning
    config.module.exprContextCritical = false;
    
    // Add specific rule for OpenTelemetry instrumentation warning
    if (isServer) {
      config.ignoreWarnings = [
        /Critical dependency: the request of a dependency is an expression/,
        /Module not found: Can't resolve 'pg-native'/,
      ];
    }
    
    return config;
  },
}

module.exports = nextConfig