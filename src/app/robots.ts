import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buscarinstrutor.com.br'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/login'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
