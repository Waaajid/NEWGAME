/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Next.js 15 specific configurations
  experimental: {
    // Enable React 19 features if using React 19
    // reactRoot: true,
    // Enable the new App Router features
    serverActions: true,
  },
}

module.exports = nextConfig
