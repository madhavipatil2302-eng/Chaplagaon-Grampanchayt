const envBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL
const BASE_URL = envBaseUrl && !envBaseUrl.includes('5001') ? envBaseUrl : 'http://localhost:8000'

function authHeaders() {
  const token = localStorage.getItem('accesstoken')

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

export async function getPermissionMatrix() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/permissions`, {
      headers: authHeaders(),
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok || data?.success === false) {
      return {
        success: false,
        message: data?.message || 'Unable to load permission matrix.',
        data: null,
      }
    }

    return {
      success: true,
      message: data?.message || 'Permission matrix loaded successfully.',
      data: data?.data || null,
    }
  } catch (error) {
    console.log('Error in getPermissionMatrix service', error)

    return {
      success: false,
      message: 'Unable to load permission matrix. Please check backend server.',
      data: null,
    }
  }
}

export async function updatePermissionMatrix(modules) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/permissions`, {
      body: JSON.stringify({ modules }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      method: 'PUT',
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok || data?.success === false) {
      return {
        success: false,
        message: data?.message || 'Unable to save permission matrix.',
        data: null,
      }
    }

    return {
      success: true,
      message: data?.message || 'Permission matrix saved successfully.',
      data: data?.data || null,
    }
  } catch (error) {
    console.log('Error in updatePermissionMatrix service', error)

    return {
      success: false,
      message: 'Unable to save permission matrix. Please check backend server.',
      data: null,
    }
  }
}
