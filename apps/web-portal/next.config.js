/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This explicitly fixes the inferred workspace root error for Turbopack
  experimental: {
    turbo: {
      root: '../../',
    },
  },
};

module.exports = nextConfig;