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
  async rewrites() {
    return [
      {
        source: '/receptionist',
        destination: '/?system=booking_receptionist',
      },
      {
        source: '/missed-call',
        destination: '/?system=missed_call_response',
      },
      {
        source: '/lead-reactivation',
        destination: '/?system=lead_reactivation',
      },
      {
        source: '/ar-collections',
        destination: '/?system=ar_collections',
      },
      {
        source: '/omni-care',
        destination: '/?system=customer_care',
      },
    ]
  },
}

export default nextConfig
