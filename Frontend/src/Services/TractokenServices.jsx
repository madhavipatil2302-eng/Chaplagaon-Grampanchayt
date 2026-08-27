

const envBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL
const BASE_URL = envBaseUrl && !envBaseUrl.includes('5001') ? envBaseUrl : 'http://localhost:8000'
export const TrackToken = async (token) => {


    try {

        const response = await fetch(`${BASE_URL}/api/track-complint`, {

            method: "POST",
            headers: {

                "Content-Type": "application/json",

            },
            body: JSON.stringify({ token })
        })
        const data = await response.json().catch(() => ({}))

        return {
            success: true,
            message: data?.message || "Token Tracked Successfully",
            data: data?.data || null
        }


    }
    catch (error) {

        return {
            success: false,
            message: "Token Not Found"
        }

    }

}