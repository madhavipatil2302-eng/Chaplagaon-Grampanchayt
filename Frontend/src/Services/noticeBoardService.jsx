import { BASE_URL, resolveBackendAssetUrl } from './apiConfig'

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
      data: data?.data || null,
      message: data?.message || fallbackMessage,
    }
  }

  return {
    success: true,
    data: data?.data || null,
    message: data?.message || 'Request completed successfully.',
  }
}

export function resolveNoticeAssetUrl(path) {
  return resolveBackendAssetUrl(path)
}

export async function getPublicNotices() {
  try {
    const response = await fetch(`${BASE_URL}/api/notices`)
    return parseResponse(response, 'Unable to load notices.')
  } catch {
    return { success: false, data: [], message: 'Unable to connect backend server.' }
  }
}

export async function getAdminNotices() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/notices`, {
      headers: authHeaders(),
    })
    return parseResponse(response, 'Unable to load notices.')
  } catch {
    return { success: false, data: [], message: 'Unable to connect backend server.' }
  }
}

export async function createNotice(payload) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  try {
    const response = await fetch(`${BASE_URL}/api/admin/notices`, {
      body: formData,
      headers: authHeaders(),
      method: 'POST',
    })
    return parseResponse(response, 'Unable to save notice.')
  } catch {
    return { success: false, data: null, message: 'Unable to connect backend server.' }
  }
}

export async function approveNotice(id) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/notices/${id}/approve`, {
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      method: 'PATCH',
    })
    return parseResponse(response, 'Unable to approve notice.')
  } catch {
    return { success: false, data: null, message: 'Unable to connect backend server.' }
  }
}

export async function rejectNotice(id, rejectionReason = '') {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/notices/${id}/reject`, {
      body: JSON.stringify({ rejectionReason }),
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      method: 'PATCH',
    })
    return parseResponse(response, 'Unable to reject notice.')
  } catch {
    return { success: false, data: null, message: 'Unable to connect backend server.' }
  }
}
