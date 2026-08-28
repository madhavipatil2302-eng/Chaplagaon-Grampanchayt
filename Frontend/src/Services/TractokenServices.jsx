

import { BASE_URL, buildApiUrl } from './apiConfig'

export const TrackToken = async (token) => {


    try {

        const response = await fetch(buildApiUrl('/track-complint'), {

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