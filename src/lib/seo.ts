// src/lib/seo.ts

import { Metadata } from 'next'

// Base metadata configuration
export const siteConfig = {
  name: 'ProjecTree',
  description: 'Join a thriving community of students sharing their stories about hackathons, cultural events, tech fests, workshops, and more.',
  url: 'https://projectree.com', // Replace with your actual domain
  ogImage: '/og-image.jpg',      // Add this image to your public folder
  links: {
    twitter: 'https://twitter.com/projectree',  // Replace with actual social links
    github: 'https://github.com/projectree'
  }
}

// Helper to construct metadata for any page
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  noIndex = false,
  pathname = ''
}: {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
  pathname?: string
}): Metadata {
  const fullUrl = `${siteConfig.url}${pathname}`
  
  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`
    },
    description,
    openGraph: {
      title: {
        default: title,
        template: `%s | ${siteConfig.name}`
      },
      description,
      siteName: siteConfig.name,
      type: 'website',
      url: fullUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@projectree' // Replace with your Twitter handle
    },
    alternates: {
      canonical: fullUrl
    },
    metadataBase: new URL(siteConfig.url),
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1
      }
    }
  }
}