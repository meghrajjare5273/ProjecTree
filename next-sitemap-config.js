/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://projectree.com', // Replace with your actual domain
    generateRobotsTxt: true,
    generateIndexSitemap: true,
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 7000,
    exclude: [
      '/admin/*',  // Exclude admin pages
      '/api/*',    // Exclude API routes
      '/private/*' // Exclude private pages
    ],
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/admin',
            '/private',
            '/api'
          ]
        }
      ],
      additionalSitemaps: [
        // Add any additional sitemaps here if needed
        // 'https://projectree.com/server-sitemap.xml'
      ]
    },
    // Transform how each page path is shown in the sitemap
    transform: async (config, path) => {
      // Custom transformation for page paths
      return {
        loc: path, // page location
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: new Date().toISOString(),
        // Optionally add alternateRefs for i18n
        // alternateRefs: [
        //   {
        //     href: `https://projectree.com${path}`,
        //     hreflang: 'en'
        //   }
        // ]
      }
    }
  }