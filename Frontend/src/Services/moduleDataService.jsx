import { BASE_URL, resolveBackendAssetUrl } from './apiConfig'

const assetFields = ['mediaFile', 'projectImage', 'panchayatImage', 'profilePhoto', 'attachment']
const skippedFileFields = [
  'attachment',
  'mediaPreview',
  'panchayatImagePreview',
  'profilePhoto',
  'projectImagePreview',
  'signature',
  'signaturePreview',
]

function authHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('accesstoken')

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok || data?.success === false) {
    return {
      success: false,
      data: normalizeAssetUrls(data?.data || null),
      message: data?.message || fallbackMessage,
    }
  }

  return {
    success: true,
    data: normalizeAssetUrls(data?.data || null),
    message: data?.message || 'Request completed successfully.',
  }
}

function resolveServiceAssetUrl(path) {
  return resolveBackendAssetUrl(path)
}

function normalizeAssetUrls(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeAssetUrls(item))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const normalized = { ...value }

  assetFields.forEach((field) => {
    if (normalized[field]) {
      normalized[field] = resolveServiceAssetUrl(normalized[field])
    }
  })

  return normalized
}

async function requestJson(path, options = {}) {
  try {
    const headers = {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      cache: 'no-store',
      headers: authHeaders(headers),
    })

    return parseResponse(response, 'Request failed.')
  } catch (error) {
    console.log('API request failed', error)

    return {
      success: false,
      data: null,
      message: 'Unable to connect backend server.',
    }
  }
}

async function requestForm(path, formData, method = 'POST') {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      body: formData,
      cache: 'no-store',
      headers: authHeaders(),
      method,
    })

    return parseResponse(response, 'Request failed.')
  } catch (error) {
    console.log('API form request failed', error)

    return {
      success: false,
      data: null,
      message: 'Unable to connect backend server.',
    }
  }
}

export function getPanchayatInfos() {
  return requestJson('/api/admin/panchayat-info')
}

export function getPublicPanchayatInfo() {
  return requestJson('/api/panchayat-info/latest')
}

function buildPanchayatFormData(payload) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (skippedFileFields.includes(key) || key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') {
      return
    }

    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  return formData
}

export function savePanchayatInfo(payload) {
  return requestForm('/api/admin/panchayat-info', buildPanchayatFormData(payload))
}

export function updatePanchayatInfo(id, payload) {
  return requestForm(`/api/admin/panchayat-info/${id}`, buildPanchayatFormData(payload), 'PUT')
}

export function deletePanchayatInfo(id) {
  return requestJson(`/api/admin/panchayat-info/${id}`, {
    method: 'DELETE',
  })
}

export function getVillageStatistics() {
  return requestJson('/api/admin/village-statistics')
}

export function getPublicVillageStatistics() {
  return requestJson('/api/village-statistics/latest')
}

export function saveVillageStatistics(payload) {
  return requestJson('/api/admin/village-statistics', {
    body: JSON.stringify(payload),
    method: 'POST',
  })
}

export function updateVillageStatistics(id, payload) {
  return requestJson(`/api/admin/village-statistics/${id}`, {
    body: JSON.stringify(payload),
    method: 'PUT',
  })
}

export function getOngoingProjects() {
  return requestJson('/api/admin/ongoing-projects')
}

export function getPublicOngoingProjects() {
  return requestJson('/api/ongoing-projects')
}

function buildOngoingProjectFormData(payload) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (skippedFileFields.includes(key) || key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') {
      return
    }

    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  return formData
}

export function saveOngoingProject(payload) {
  return requestForm('/api/admin/ongoing-projects', buildOngoingProjectFormData(payload))
}

export function updateOngoingProject(id, payload) {
  return requestForm(`/api/admin/ongoing-projects/${id}`, buildOngoingProjectFormData(payload), 'PUT')
}

export function deleteOngoingProject(id) {
  return requestJson(`/api/admin/ongoing-projects/${id}`, {
    method: 'DELETE',
  })
}

export function getMediaUploads() {
  return requestJson('/api/admin/media-uploads')
}

export function getPublicMediaUploads() {
  return requestJson('/api/media-uploads')
}

export function saveMediaUpload(payload) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (skippedFileFields.includes(key)) {
      return
    }

    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  return requestForm('/api/admin/media-uploads', formData)
}

export function updateMediaUpload(id, payload) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (skippedFileFields.includes(key) || key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') {
      return
    }

    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  return requestForm(`/api/admin/media-uploads/${id}`, formData, 'PUT')
}

export function deleteMediaUpload(id) {
  return requestJson(`/api/admin/media-uploads/${id}`, {
    method: 'DELETE',
  })
}

export function getPublicSchemes() {
  return requestJson('/api/schemes')
}

export function getSchemes() {
  return requestJson('/api/admin/schemes')
}

export function saveScheme(payload) {
  return requestJson('/api/admin/schemes', {
    body: JSON.stringify(payload),
    method: 'POST',
  })
}

export function updateScheme(id, payload) {
  return requestJson(`/api/admin/schemes/${id}`, {
    body: JSON.stringify(payload),
    method: 'PUT',
  })
}

export function deleteScheme(id) {
  return requestJson(`/api/admin/schemes/${id}`, {
    method: 'DELETE',
  })
}
