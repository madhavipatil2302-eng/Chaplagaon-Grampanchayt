
import { BASE_URL } from './apiConfig'

export const UserAI = async (qun, schemes = [], ongoingProjects = [], emptyVillageStatistics = null) => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 35000)

  try {
    const data = { qun, schemes, ongoingProjects, emptyVillageStatistics }

    const response = await fetch(`${BASE_URL}/api/user-ai`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: controller.signal,
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok || result?.success === false) {
      return {
        success: false,
        data: null,
        message: result?.message || result?.error || 'Unable to generate response.',
      }
    }

    return result
  } catch (error) {
    console.log(error)

    return {
      success: false,
      data: null,
      message: error?.name === 'AbortError'
        ? 'AI could not respond quickly. Please try again.'
        : 'Unable to connect backend server.',
    }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export const analyzeComplaint = async (complaintText) => {
  const prompt = `
Analyze this Gram Panchayat complaint and return only JSON.
Use this exact shape:
{"name":"short complaint title","category":"Water Supply | Road | Street Light | Sanitation | Property Tax | Certificate | Public Works | Other","description":"short clear complaint description"}

Complaint:
${complaintText}
`.trim()

  const response = await UserAI(prompt)
  const rawText = response?.data || response?.message || ''
  const jsonMatch = String(rawText).match(/\{[\s\S]*\}/)

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])

      return {
        success: true,
        data: {
          category: parsed?.category || 'Other',
          name: parsed?.name || String(complaintText || '').trim().slice(0, 60),
          description: parsed?.description || complaintText,
        },
      }
    } catch {
      // Fall through to local analysis below.
    }
  }

  const text = String(complaintText || '').toLowerCase()
  const categoryRules = [
    ['Water Supply', ['water', 'pani', 'पाणी', 'नळ', 'pipe', 'drainage']],
    ['Road', ['road', 'रस्ता', 'khadda', 'pothole', 'गड्डा']],
    ['Street Light', ['light', 'streetlight', 'लाईट', 'दिवा']],
    ['Sanitation', ['garbage', 'kachra', 'कचरा', 'clean', 'स्वच्छ']],
    ['Property Tax', ['tax', 'property', 'कर', 'मालमत्ता']],
    ['Certificate', ['certificate', 'दाखला', 'birth', 'death']],
    ['Public Works', ['construction', 'काम', 'project', 'building']],
  ]
  const matched = categoryRules.find(([, words]) => words.some((word) => text.includes(word)))

  return {
    success: true,
    data: {
      category: matched?.[0] || 'Other',
      name: String(complaintText || '').trim().slice(0, 60),
      description: String(complaintText || '').trim(),
    },
  }
}

export const analyzeComplaintFile = async (file) => {
  const formData = new FormData()

  formData.append('file', file)

  try {
    const response = await fetch(`${BASE_URL}/api/complint-file-ai`, {
      body: formData,
      method: 'POST',
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok || result?.success === false) {
      return {
        success: false,
        data: null,
        message: result?.message || 'Unable to analyze uploaded file.',
      }
    }

    return result
  } catch (error) {
    console.log(error)

    return {
      success: false,
      data: null,
      message: 'Unable to connect backend server.',
    }
  }
}

export const submitComplaintAI = async ({ token, complaintName, complint, description, category, name, email, contact, files = [] }) => {
  const formData = new FormData()

  formData.append('token', token)
  formData.append('complaintName', complaintName || complint)
  formData.append('complint', complint)
  formData.append('description', description)
  formData.append('category', category)
  formData.append('name', name)
  formData.append('email', email)
  formData.append('contact', contact)
  files.forEach((file) => formData.append('files', file))

  try {
    const response = await fetch(`${BASE_URL}/api/complint-ai`, {
      body: formData,
      method: 'POST',
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok || result?.success === false) {
      return {
        success: false,
        data: null,
        message: result?.message || 'Unable to submit complaint.',
      }
    }

    return result
  } catch (error) {
    console.log(error)

    return {
      success: false,
      data: null,
      message: 'Unable to connect backend server.',
    }
  }
}
