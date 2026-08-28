const envBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL

export function getBackendBaseUrl() {
  if (envBaseUrl && !envBaseUrl.includes('5001')) {
    return envBaseUrl.replace(/\/+$/, '')
  }

  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname)
  ) {
    return `${window.location.protocol}//${window.location.hostname}:8000`
  }

  return 'http://localhost:8000'
}

export const BASE_URL = getBackendBaseUrl()

export function resolveBackendAssetUrl(path) {
  if (!path || typeof path !== 'string') {
    return path || ''
  }

  if (path.startsWith('blob:') || path.startsWith('data:')) {
    return path
  }

  try {
    const url = new URL(path)
    const isLocalBackend = ['localhost', '127.0.0.1'].includes(url.hostname)

    if (isLocalBackend && url.pathname.startsWith('/uploads/')) {
      if (BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')) {
        const uploadBase = BASE_URL.replace(/\/api\/?$/, '')
        return new URL(`${url.pathname}${url.search}`, uploadBase.endsWith('/') ? uploadBase : `${uploadBase}/`).toString()
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
