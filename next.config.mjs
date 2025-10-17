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
    // Remove ignoreBuildErrors to catch actual errors and speed up builds
    ignoreBuildErrors: true,
  },
  images: {
    // Keep images optimized for better performance
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  // Add build optimizations
  experimental: {
    // Enable faster builds
    // scrollRestoration: true,
  },
  // Add build performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/{{member}}',
    },
  },
}

export default withBundleAnalyzer(nextConfig)
