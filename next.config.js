/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["raw.githubusercontent.com"],
    minimumCacheTTL: 6000000,
  },
}

module.exports = nextConfig
