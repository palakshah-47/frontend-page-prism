import { Project, Inspiration, WebsiteMetadata } from '../models/schema'

/**
 * Mock Website Metadata - Realistic data from actual websites
 */
const mockWebsiteMetadataList: WebsiteMetadata[] = [
  {
    url: 'https://dribbble.com/shots/20845623-Mobile-App-Design-System',
    title: 'Mobile App Design System - Dribbble',
    description:
      'Explore a comprehensive design system for mobile applications with components, patterns, and guidelines.',
    favicon:
      'https://cdn.dribbble.com/assets/favicon-cd63d959e3e3e4b0c0b1b6e9c8e8c8e8.ico',
    author: 'John Smith',
    date: '2024-01-15',
    image:
      'https://cdn.dribbble.com/users/1234567/screenshots/20845623/media/d1b2c3d4e5f6g7h8.png',
    logo: 'https://cdn.dribbble.com/assets/logo-0e01b42013d953de47bdd812a7f67c26.png',
    publisher: 'Dribbble',
    ogTitle: 'Mobile App Design System',
    ogDescription: 'Comprehensive design system for mobile applications',
    ogImage: [
      {
        url: 'https://cdn.dribbble.com/users/1234567/screenshots/20845623/media/d1b2c3d4e5f6g7h8.png',
        type: 'image/png',
      },
    ],
    ogLocale: 'en_US',
    ogUrl: 'https://dribbble.com/shots/20845623-Mobile-App-Design-System',
    charset: 'UTF-8',
    urlRequested:
      'https://dribbble.com/shots/20845623-Mobile-App-Design-System',
    urlResolved: 'https://dribbble.com/shots/20845623-Mobile-App-Design-System',
  },
  {
    url: 'https://github.com/vercel/next.js',
    title: 'vercel/next.js: The React Framework for Production',
    description:
      'The React Framework for Production - Easily build performant & scalable full stack web applications.',
    favicon: 'https://github.githubassets.com/favicon.ico',
    author: 'Vercel',
    date: '2024-02-10',
    image:
      'https://repository-images.githubusercontent.com/76480642/next-js-banner.png',
    logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    publisher: 'GitHub',
    ogTitle: 'vercel/next.js: The React Framework for Production',
    ogDescription: 'The React Framework for Production',
    ogImage: [
      {
        url: 'https://repository-images.githubusercontent.com/76480642/next-js-banner.png',
        type: 'image/png',
      },
    ],
    ogLocale: 'en_US',
    ogUrl: 'https://github.com/vercel/next.js',
    charset: 'UTF-8',
    urlRequested: 'https://github.com/vercel/next.js',
    urlResolved: 'https://github.com/vercel/next.js',
  },
  {
    url: 'https://www.figma.com/design-systems',
    title: 'Design Systems - Figma',
    description:
      'Create, maintain, and scale design systems with Figma. Build better products faster with collaborative design tools.',
    favicon: 'https://www.figma.com/favicon.ico',
    author: 'Figma Inc.',
    date: '2024-02-08',
    image: 'https://cdn.sanity.io/images/599r6htc/ca0f8d85c28c8c8a/image.png',
    logo: 'https://www.figma.com/favicon.ico',
    publisher: 'Figma',
    ogTitle: 'Design Systems - Figma',
    ogDescription: 'Create and maintain design systems with Figma',
    ogImage: [
      {
        url: 'https://cdn.sanity.io/images/599r6htc/ca0f8d85c28c8c8a/image.png',
        type: 'image/png',
      },
    ],
    ogLocale: 'en_US',
    ogUrl: 'https://www.figma.com/design-systems',
    charset: 'UTF-8',
    urlRequested: 'https://www.figma.com/design-systems',
    urlResolved: 'https://www.figma.com/design-systems',
  },
  {
    url: 'https://www.behance.net/search/projects/ui-design',
    title: 'UI Design Projects - Behance',
    description:
      'Explore outstanding UI design projects on Behance. Discover creative work from designers around the world.',
    favicon: 'https://www.behance.net/favicon.ico',
    author: 'Adobe',
    date: '2024-01-20',
    image: 'https://mir-s3-cdn-cf.behance.net/projects/max_808_/image.jpg',
    logo: 'https://www.behance.net/adobe-logo.svg',
    publisher: 'Behance',
    ogTitle: 'UI Design Projects - Behance',
    ogDescription: 'Explore outstanding UI design projects',
    ogImage: [
      {
        url: 'https://mir-s3-cdn-cf.behance.net/projects/max_808_/image.jpg',
        type: 'image/jpeg',
      },
    ],
    ogLocale: 'en_US',
    ogUrl: 'https://www.behance.net/search/projects/ui-design',
    charset: 'UTF-8',
    urlRequested: 'https://www.behance.net/search/projects/ui-design',
    urlResolved: 'https://www.behance.net/search/projects/ui-design',
  },
  {
    url: 'https://twitter.com/design',
    title: 'Twitter Design (@design)',
    description:
      'Exploring the what, why, and how of design at Twitter. Updates on product design, research, and more.',
    favicon: 'https://abs.twimg.com/responsive-web/client-web/favicon.ico',
    author: 'Twitter',
    date: '2024-02-05',
    image:
      'https://pbs.twimg.com/profile_images/1445764532/design_profile_normal.jpg',
    logo: 'https://abs.twimg.com/sticky/twitter_logo_blue.png',
    publisher: 'Twitter',
    ogTitle: 'Twitter Design',
    ogDescription: 'Exploring the what, why, and how of design at Twitter',
    ogImage: [
      {
        url: 'https://pbs.twimg.com/profile_images/1445764532/design_profile_normal.jpg',
        type: 'image/jpeg',
      },
    ],
    ogLocale: 'en_US',
    ogUrl: 'https://twitter.com/design',
    charset: 'UTF-8',
    urlRequested: 'https://twitter.com/design',
    urlResolved: 'https://twitter.com/design',
  },
  {
    url: 'https://www.awwwards.com',
    title: 'Awwwards - Website Design Inspiration & Trends',
    description:
      'Discover the latest web design trends and find inspiration from award-winning websites.',
    favicon: 'https://www.awwwards.com/favicon.ico',
    author: null,
    date: '2024-02-12',
    image: 'https://www.awwwards.com/awards/images/2024/02/awwwards-banner.jpg',
    logo: 'https://www.awwwards.com/images/awwwards-logo.svg',
    publisher: 'Awwwards',
    ogTitle: 'Awwwards - Website Design Inspiration',
    ogDescription: 'Award-winning website design inspiration',
    ogImage: [
      {
        url: 'https://www.awwwards.com/awards/images/2024/02/awwwards-banner.jpg',
        type: 'image/jpeg',
      },
    ],
    ogLocale: 'en_US',
    ogUrl: 'https://www.awwwards.com',
    charset: 'UTF-8',
    urlRequested: 'https://www.awwwards.com',
    urlResolved: 'https://www.awwwards.com',
  },
]

/**
 * Mock Inspirations
 */
const mockInspirations: Inspiration[] = [
  {
    id: 'insp_001',
    projectId: 'proj_001',
    websiteMetadata: mockWebsiteMetadataList[0],
    screenshot_uri:
      'https://screenshots.example.com/dribbble-mobile-design-001.png',
    notes:
      'Love the minimalist approach to component organization. Great visual hierarchy with the color scheme.',
    createdAt: '2024-02-01T10:30:00Z',
    updatedAt: '2024-02-05T14:20:00Z',
  },
  {
    id: 'insp_002',
    projectId: 'proj_001',
    websiteMetadata: mockWebsiteMetadataList[1],
    screenshot_uri: 'https://screenshots.example.com/github-nextjs-001.png',
    notes:
      'Excellent documentation layout. The navigation structure is clean and intuitive.',
    createdAt: '2024-02-02T09:15:00Z',
    updatedAt: '2024-02-06T11:45:00Z',
  },
  {
    id: 'insp_003',
    projectId: 'proj_001',
    websiteMetadata: mockWebsiteMetadataList[2],
    screenshot_uri:
      'https://screenshots.example.com/figma-design-systems-001.png',
    notes:
      'Perfect example of how to present design systems. The component showcase is very well organized.',
    createdAt: '2024-02-03T14:00:00Z',
    updatedAt: '2024-02-07T16:30:00Z',
  },
  {
    id: 'insp_004',
    projectId: 'proj_002',
    websiteMetadata: mockWebsiteMetadataList[3],
    screenshot_uri: 'https://screenshots.example.com/behance-ui-design-001.png',
    notes:
      'Creative use of whitespace and typography. Color palette is inspiring.',
    createdAt: '2024-01-28T11:20:00Z',
    updatedAt: '2024-02-08T09:00:00Z',
  },
  {
    id: 'insp_005',
    projectId: 'proj_002',
    websiteMetadata: mockWebsiteMetadataList[4],
    screenshot_uri: 'https://screenshots.example.com/twitter-design-001.png',
    notes: 'Responsive design done right. Mobile experience is seamless.',
    createdAt: '2024-01-30T15:45:00Z',
    updatedAt: '2024-02-09T13:20:00Z',
  },
  {
    id: 'insp_006',
    projectId: 'proj_003',
    websiteMetadata: mockWebsiteMetadataList[5],
    screenshot_uri: 'https://screenshots.example.com/awwwards-design-001.png',
    notes:
      'Award-winning design with stunning visual effects. Great attention to micro-interactions.',
    createdAt: '2024-02-04T12:30:00Z',
    updatedAt: '2024-02-10T10:15:00Z',
  },
]

/**
 * Mock Projects
 */
const mockProjects: Project[] = [
  {
    id: 'proj_001',
    name: 'E-Commerce Product Page Redesign',
    description:
      'Comprehensive redesign of the product page to improve conversion rates and user engagement.',
    createdAt: '2024-01-25T08:00:00Z',
    updatedAt: '2024-02-15T16:45:00Z',
    inspirations: mockInspirations.filter(
      (insp) => insp.projectId === 'proj_001'
    ),
  },
  {
    id: 'proj_002',
    name: 'SaaS Dashboard UI Overhaul',
    description:
      'Modernizing the dashboard interface with improved analytics visualization and user controls.',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-02-14T12:00:00Z',
    inspirations: mockInspirations.filter(
      (insp) => insp.projectId === 'proj_002'
    ),
  },
  {
    id: 'proj_003',
    name: 'Mobile App Navigation Flow',
    description:
      'Designing an intuitive navigation system for a multi-feature mobile application.',
    createdAt: '2024-02-05T13:20:00Z',
    updatedAt: '2024-02-16T09:30:00Z',
    inspirations: mockInspirations.filter((insp) => insp.projectId === 'proj_003'),
  },
]

export { mockProjects, mockInspirations, mockWebsiteMetadataList }
