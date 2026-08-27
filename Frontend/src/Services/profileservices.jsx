import { BASE_URL, resolveBackendAssetUrl } from './apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accesstoken')

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function resolveProfileImage(path) {
  return resolveBackendAssetUrl(path)
}

export async function getProfile() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/profile`, {
      headers: authHeaders(),
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok || data?.success === false) {
      return {
        success: false,
        message: data?.message || 'Unable to load profile.',
        data: null,
      }
    }

    return {
      success: true,
      data: data.data,
    }
  } catch (error) {
    console.log('Error in getProfile service', error)

    return {
      success: false,
      message: 'Unable to load profile. Please check backend server.',
      data: null,
    }
  }
}

export async function updateProfile(profileData) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(profileData),
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok || data?.success === false) {
      return {
        success: false,
        message: data?.message || 'Unable to update profile.',
        data: null,
      }
    }

    return {
      success: true,
      message: data?.message || 'Profile updated successfully.',
      data: data.data,
    }
  } catch (error) {
    console.log('Error in updateProfile service', error)

    return {
      success: false,
      message: 'Unable to update profile. Please check backend server.',
      data: null,
    }
  }
}
