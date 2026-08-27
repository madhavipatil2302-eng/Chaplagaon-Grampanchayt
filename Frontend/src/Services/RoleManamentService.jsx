const envBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL;
const BASE_URL = envBaseUrl && !envBaseUrl.includes('5001') ? envBaseUrl : 'http://localhost:8000';

export const ManageRole = async (roleData) => {
  try {
    const token = localStorage.getItem('accesstoken');

    const response = await fetch(`${BASE_URL}/api/admin/manage-role`, {
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

