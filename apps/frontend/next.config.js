const apiProxyUrl = (
  process.env.API_INTERNAL_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001'
).replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiProxyUrl}/uploads/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${apiProxyUrl}/socket.io/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
