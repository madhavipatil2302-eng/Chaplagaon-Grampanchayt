
import { BASE_URL, buildApiUrl } from './apiConfig'

export const GetAllNotification = async () => {

    const token = localStorage.getItem("accesstoken");
    try {

        const Response = await fetch(buildApiUrl('/get-all-notification-complints'), {

            method: "Get",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const Data = await Response.json();

        return Data;
    }
    catch (error) {


        return error;
    }
}

export const ViewNotificationById = async (id) => {

    const token = localStorage.getItem("accesstoken");
    try {

        const Response = await fetch(buildApiUrl(`/get-notificationbyId/${id}`), {

            method: "Get",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        const Data = await Response.json();

        return Data;

    }
    catch (error) {

        return error.message;
    }

}

export const UpdateStatusNotification = async (id, status) => {
    const token = localStorage.getItem("accesstoken");

    try {

        const response = await fetch(buildApiUrl(`/status/${id}`), {

            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        })

        const data = await response.json();

        return data;
    }
    catch (error) {

        return { success: false, message: error.message };
    }
}