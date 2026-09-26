/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    cpus: 4,
  },
  async redirects() {
    return [
      { source: '/receptionist', destination: '/systems/booking-receptionist', permanent: true },
      { source: '/missed-call', destination: '/systems/missed-call-responder', permanent: true },
      { source: '/lead-reactivation', destination: '/systems/lead-reactivation', permanent: true },
      { source: '/ar-collections', destination: '/systems/ar-invoicing', permanent: true },
      { source: '/build', destination: '/contact?scope=custom', permanent: false },
    ]
  },
}

export default nextConfig
