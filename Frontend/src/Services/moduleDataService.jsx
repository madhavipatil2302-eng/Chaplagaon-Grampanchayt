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
  return requestJson('/admin/panchayat-info')
}

export function getPublicPanchayatInfo() {
  return requestJson('/panchayat-info/latest')
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
  return requestForm('/admin/panchayat-info', buildPanchayatFormData(payload))
}

export function updatePanchayatInfo(id, payload) {
  return requestForm(`/admin/panchayat-info/${id}`, buildPanchayatFormData(payload), 'PUT')
}

export function deletePanchayatInfo(id) {
  return requestJson(`/admin/panchayat-info/${id}`, {
    method: 'DELETE',
  })
}

export function getVillageStatistics() {
  return requestJson('/admin/village-statistics')
}

export function getPublicVillageStatistics() {
  return requestJson('/village-statistics/latest')
}

export function saveVillageStatistics(payload) {
  return requestJson('/admin/village-statistics', {
    body: JSON.stringify(payload),
    method: 'POST',
  })
}

export function updateVillageStatistics(id, payload) {
  return requestJson(`/admin/village-statistics/${id}`, {
    body: JSON.stringify(payload),
    method: 'PUT',
  })
}

export function getOngoingProjects() {
  return requestJson('/admin/ongoing-projects')
}

export function getPublicOngoingProjects() {
  return requestJson('/ongoing-projects')
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
  return requestForm('/admin/ongoing-projects', buildOngoingProjectFormData(payload))
}

export function updateOngoingProject(id, payload) {
  return requestForm(`/admin/ongoing-projects/${id}`, buildOngoingProjectFormData(payload), 'PUT')
}

export function deleteOngoingProject(id) {
  return requestJson(`/admin/ongoing-projects/${id}`, {
    method: 'DELETE',
  })
}

export function getMediaUploads() {
  return requestJson('/admin/media-uploads')
}

export function getPublicMediaUploads() {
  return requestJson('/media-uploads')
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

  return requestForm('/admin/media-uploads', formData)
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

  return requestForm(`/admin/media-uploads/${id}`, formData, 'PUT')
}

export function deleteMediaUpload(id) {
  return requestJson(`/admin/media-uploads/${id}`, {
    method: 'DELETE',
  })
}

export function getPublicSchemes() {
  return requestJson('/schemes')
}

export function getSchemes() {
  return requestJson('/admin/schemes')
}

export function saveScheme(payload) {
  return requestJson('/admin/schemes', {
    body: JSON.stringify(payload),
    method: 'POST',
  })
}

export function updateScheme(id, payload) {
  return requestJson(`/admin/schemes/${id}`, {
    body: JSON.stringify(payload),
    method: 'PUT',
  })
}

export function deleteScheme(id) {
  return requestJson(`/admin/schemes/${id}`, {
    method: 'DELETE',
  })
}
