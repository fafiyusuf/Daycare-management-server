/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  // Enable standalone output for Docker
  output: "standalone",
  // Disable source maps in production for smaller bundle size
  productionBrowserSourceMaps: false,
  // Enable compression
  compress: true,
  // Optimize for Docker
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
}

module.exports = nextConfig
