import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright', '@mozilla/readability', 'jsdom', 'pg'],
}

export default nextConfig
