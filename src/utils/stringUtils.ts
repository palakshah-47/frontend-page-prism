/**
 * Takes a string as input, then truncates it for display in the UI
 */
export const truncateString = (string: string): string => {
  return string
}

export const normalizeUrl = (input: string): string | null => {
  const trimmed = input.trim()
  if (!trimmed) return null
  const withScheme = /^[a-z][a-z\d+\-.]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null
    return url.href
  } catch {
    return null
  }
}
