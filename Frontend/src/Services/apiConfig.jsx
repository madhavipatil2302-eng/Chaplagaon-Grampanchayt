const envBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL

export function getBackendBaseUrl() {
  if (envBaseUrl && typeof envBaseUrl === 'string' && envBaseUrl.trim() !== '') {
    return envBaseUrl.replace(/\/+$/, '')
  }
  return '/api'
}

export const BASE_URL = getBackendBaseUrl()

export function buildApiUrl(path = '') {
  if (!path || typeof path !== 'string') return BASE_URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  
  // Normalize path: remove leading slashes
  let normalizedPath = path.startsWith('/') ? path.substring(1) : path
  
  // If path starts with api/, remove it to avoid duplication
  if (normalizedPath.toLowerCase().startsWith('api/')) {
    normalizedPath = normalizedPath.substring(4)
  }
  
  // Build the full URL, ensuring BASE_URL ends without slash and path starts without slash
  const baseWithoutTrailingSlash = BASE_URL.replace(/\/+$/, '')
  return normalizedPath ? `${baseWithoutTrailingSlash}/${normalizedPath}` : baseWithoutTrailingSlash
}

export function resolveBackendAssetUrl(path) {
  if (!path || typeof path !== 'string') {
    return path || ''
  }

  if (path.startsWith('blob:') || path.startsWith('data:')) {
    return path
  }

  try {
    const url = new URL(path)
    if (url.pathname.startsWith('/uploads/')) {
      if (BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')) {
        const uploadBase = BASE_URL.replace(/\/api\/?$/, '')
        return `${uploadBase.replace(/\/+$/, '')}${url.pathname}${url.search}`
      }
      return `${url.pathname}${url.search}`
    }
    return url.toString()
  } catch {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    if (BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')) {
      const uploadBase = BASE_URL.replace(/\/api\/?$/, '')
      return `${uploadBase.replace(/\/+$/, '')}${normalizedPath}`
    }
    return normalizedPath
  }
}
