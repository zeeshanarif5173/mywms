/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Disable static optimization for API routes
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        './node_modules/@swc/core-*',
        './node_modules/next/dist/compiled/@swc/core-*',
      ],
    },
  },
  // Skip static generation for API routes during build
  async generateBuildId() {
    // Use a static build ID to avoid build-time data collection issues
    return 'build-' + Date.now()
  },
  // Handle build-time database connection issues
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'sqlite3', 'pg-native', '@prisma/client']
    }
    
    // Disable static optimization for API routes
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client$': false,
      }
    }
    
    return config
  },
  // Disable static optimization for pages that use API routes
  trailingSlash: false,
  // Skip build-time data collection for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
