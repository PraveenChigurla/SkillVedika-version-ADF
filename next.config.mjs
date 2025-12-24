/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Proxy: forward any /api requests to the backend Laravel server.
  // In production (Vercel), use NEXT_PUBLIC_API_URL environment variable.
  // In development, fallback to localhost.
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    // Remove /api suffix if present to avoid double /api/api
    const baseUrl = backendUrl.replace(/\/api\/?$/, '');
    
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
    ];
  },

}

export default nextConfig
