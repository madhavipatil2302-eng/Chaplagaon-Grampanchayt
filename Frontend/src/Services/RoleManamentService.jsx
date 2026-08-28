import { BASE_URL, buildApiUrl } from './apiConfig'

export const ManageRole = async (roleData) => {
  try {
    const token = localStorage.getItem('accesstoken');

    const response = await fetch(buildApiUrl('/admin/manage-role'), {
      method: 'POST',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      body: roleData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.success === false) {
      return {
        success: false,
        message: data?.message || 'Unable to save role details.',
        data,
      };
    }

    return {
      success: true,
      message: data?.message || 'Role details saved successfully.',
      data,
    };
  } catch (err) {
    console.log('Error in ManageRole service', err);

    return {
      success: false,
      message: 'Unable to save role details. Please check backend server.',
    };
  }
};

