import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/pricing', '/updates', '/about', '/contact', '/terms', '/privacy'],
      disallow: [
        '/admin',
        '/admin/*',
        '/dashboard',
        '/dashboard/*',
        '/settings',
        '/settings/*',
        '/api',
        '/api/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
