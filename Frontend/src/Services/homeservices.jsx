import { BASE_URL, resolveBackendAssetUrl } from './apiConfig'

export { getPermissionMatrix, updatePermissionMatrix } from './permissionService'
export {
  getMediaUploads,
  getOngoingProjects,
  getPanchayatInfos,
  getPublicOngoingProjects,
  getPublicPanchayatInfo,
  getPublicMediaUploads,
  getPublicSchemes,
  getPublicVillageStatistics,
  getSchemes,
  getVillageStatistics,
  deletePanchayatInfo,
  deleteScheme,
  saveMediaUpload,
  saveOngoingProject,
  savePanchayatInfo,
  saveScheme,
  saveVillageStatistics,
  deleteMediaUpload,
  deleteOngoingProject,
  updateMediaUpload,
  updateOngoingProject,
  updatePanchayatInfo,
  updateScheme,
  updateVillageStatistics,
} from './moduleDataService'

export function resolveAssetUrl(path) {
  return resolveBackendAssetUrl(path)
}

export async function getAllRoleManagements() {
  try {
    const response = await fetch(`${BASE_URL}/get-all-role-managements`)
    const data = await response.json().catch(() => ({}))

    if (!response.ok || data?.success === false) {
      return {
        success: false,
        data: [],
        message: data?.message || 'Unable to load role details.',
      }
    }

    return {
      success: true,
      data: Array.isArray(data?.data) ? data.data : [],
      message: data?.message || 'Role details loaded.',
    }
  } catch (error) {
    console.log('Error in getAllRoleManagements service', error)

    return {
      success: false,
      data: [],
      message: 'Unable to load role details. Please check backend server.',
    }
  }
}
