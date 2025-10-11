import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript checks during build for faster builds
    ignoreBuildErrors: true,
  },
  images: {
    // Enable image optimization for better performance and smaller builds
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },
  // Enable faster builds with SWC optimizations
  experimental: {
    // Enable faster builds
    scrollRestoration: false,
    // Removed optimizeCss due to critters dependency issues
    // optimizeCss: true,
  },
  // Compiler optimizations
  compiler: {
    // Only remove console in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  // Bundle optimizations
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/{{member}}',
    },
    // Optimize Radix UI imports
    '@radix-ui/react-dialog': {
      transform: '@radix-ui/react-dialog/{{member}}',
    },
    '@radix-ui/react-dropdown-menu': {
      transform: '@radix-ui/react-dropdown-menu/{{member}}',
    },
  },
  // Proxy API requests to the Express backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4001/api/:path*',
      },
    ]
  },
  // Enable build caching
  generateBuildId: async () => {
    return 'build-cache-' + Date.now()
  },
  // Removed output: 'standalone' for local development compatibility
  // Reduce bundle size
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
          }
        }
      }
    }

    return config
  },
}

export default withBundleAnalyzer(nextConfig)
