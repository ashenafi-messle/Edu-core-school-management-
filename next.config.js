/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Performance optimizations
  compress: true,
  // Reduce build time and improve performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion', 'recharts'],
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
