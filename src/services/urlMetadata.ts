import type { WebsiteMetadata } from '../models/schema'

const CORS_PROXY = 'https://api.allorigins.win/raw'

/**
 * Fetches HTML from a URL via a CORS proxy and parses metadata.
 * Extracts title, description, favicon, and og:image from the page.
 */
async function fetchHtml(url: string): Promise<string> {
  const proxyUrl = `${CORS_PROXY}?url=${encodeURIComponent(url)}`
  const response = await fetch(proxyUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

function resolveUrl(base: string, path: string | null): string | null {
  if (!path || path.startsWith('data:')) return path
  try {
    return new URL(path, base).href
  } catch {
    return path
  }
}

/**
 * Parses HTML string and extracts title, description, favicon, and og:image.
 */
function parseMetadataFromHtml(html: string, pageUrl: string): Partial<WebsiteMetadata> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const origin = (() => {
    try {
      return new URL(pageUrl).origin
    } catch {
      return pageUrl
    }
  })()

  const getMeta = (name: string, attr: 'name' | 'property' = 'name'): string | null => {
    const el = doc.querySelector(`meta[${attr}="${name}"]`)
    return el?.getAttribute('content') ?? null
  }

  const title =
    getMeta('og:title', 'property') ??
    doc.querySelector('title')?.textContent?.trim() ??
    null
  const description =
    getMeta('og:description', 'property') ??
    getMeta('description') ??
    null
  const imageUrl =
    getMeta('og:image', 'property') ??
    getMeta('twitter:image', 'property') ??
    null

  let favicon: string | null = null
  const faviconEl =
    doc.querySelector('link[rel="icon"]') ??
    doc.querySelector('link[rel="shortcut icon"]') ??
    doc.querySelector('link[rel="apple-touch-icon"]')
  if (faviconEl) {
    const href = faviconEl.getAttribute('href')
    favicon = resolveUrl(origin, href)
  }
  if (!favicon) {
    favicon = resolveUrl(origin, '/favicon.ico')
  }

  const image = imageUrl ? resolveUrl(origin, imageUrl) : null

  return {
    url: pageUrl,
    title,
    description,
    favicon,
    image,
    urlRequested: pageUrl,
    urlResolved: pageUrl,
    author: null,
    date: null,
    logo: null,
    publisher: null,
    ogTitle: title,
    ogDescription: description,
    ogImage: image ? [{ url: image, type: '' }] : [],
    ogLocale: null,
    ogUrl: null,
    charset: null,
  }
}

/**
 * Builds a full WebsiteMetadata object with nulls for missing fields.
 */
function toWebsiteMetadata(
  url: string,
  parsed: Partial<WebsiteMetadata>
): WebsiteMetadata {
  return {
    url: parsed.url ?? url,
    title: parsed.title ?? null,
    description: parsed.description ?? null,
    favicon: parsed.favicon ?? null,
    author: parsed.author ?? null,
    date: parsed.date ?? null,
    image: parsed.image ?? null,
    logo: parsed.logo ?? null,
    publisher: parsed.publisher ?? null,
    ogTitle: parsed.ogTitle ?? null,
    ogDescription: parsed.ogDescription ?? null,
    ogImage: parsed.ogImage ?? [],
    ogLocale: parsed.ogLocale ?? null,
    ogUrl: parsed.ogUrl ?? null,
    charset: parsed.charset ?? null,
    urlRequested: parsed.urlRequested ?? url,
    urlResolved: parsed.urlResolved ?? url,
  }
}

/**
 * Fetches webpage title, description, and favicon for a given URL.
 * Uses a CORS proxy to load the page and parses meta tags and link tags.
 *
 * @param url - Full URL (e.g. https://example.com/page)
 * @returns WebsiteMetadata with at least url, title, description, favicon (and image when available)
 * @throws Error if the URL cannot be fetched
 */
export async function fetchUrlMetadata(url: string): Promise<WebsiteMetadata> {
  const trimmed = url.trim()
  if (!trimmed) {
    throw new Error('URL is required')
  }
  let resolved = trimmed
  if (!/^https?:\/\//i.test(trimmed)) {
    resolved = `https://${trimmed}`
  }
  const html = await fetchHtml(resolved)
  const parsed = parseMetadataFromHtml(html, resolved)
  return toWebsiteMetadata(resolved, parsed)
}
