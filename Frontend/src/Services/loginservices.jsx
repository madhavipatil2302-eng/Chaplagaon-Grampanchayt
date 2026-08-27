const envBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL;
const BASE_URL = envBaseUrl && !envBaseUrl.includes('5001') ? envBaseUrl : 'http://localhost:8000';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getErrorMessage(data, fallback) {
  return data?.message || data?.error || fallback;
}

export async function verifyAdminEmail(email) {
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/api/admin/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.success === false) {
      return {
        success: false,
        message: getErrorMessage(data, 'Email not found. Please enter a correct admin email.'),
      };
    }

    return {
      success: true,
      data,
      message: getErrorMessage(data, 'Email verified successfully.'),
    };
  } catch (error) {
    console.log('Error in verifyAdminEmail service', error);

    return {
      success: false,
      message: 'Unable to verify email. Please check backend server.',
    };
  }
}

export async function adminLogin(email, password) {
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    };
  }

  if (!password) {
    return {
      success: false,
      message: 'Please enter password.',
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });


   

    const data = await response.json().catch(() => ({}));
   

    if (!response.ok || data?.success === false) {
      return {
        success: false,
        message: getErrorMessage(data, 'Invalid email or password.'),
      };
    }

      localStorage.setItem('accesstoken', data.token);
    return {
      success: true,
      data,
      message: getErrorMessage(data, 'Login successful.'),
    };
  } catch (error) {
    console.log('Error in adminLogin service', error);

    return {
      success: false,
      message: 'Unable to login. Please check backend server.',
    };
  }
}
