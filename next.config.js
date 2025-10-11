/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Skip static optimization for API routes
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        './node_modules/@swc/core-*',
        './node_modules/next/dist/compiled/@swc/core-*',
      ],
    },
  },
  // Handle build-time database connection issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'sqlite3', 'pg-native']
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
