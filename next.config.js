/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  experimental: {
    // Disable static optimization for API routes that require database access
    outputFileTracingExcludes: {
      '*': [
        './node_modules/@swc/core-*',
        './node_modules/next/dist/compiled/@swc/core-*',
      ],
    },
  },
  // Skip static generation for API routes during build
  async rewrites() {
    return []
  },
  // Handle build-time database connection issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'sqlite3', 'pg-native']
    }
    return config
  },
}

module.exports = nextConfig
