

import MediaUploadModel from "../Shema/mediaUploadSchema.js";
import { generatePresignedUrlFromString } from "../Uploadfile/fileupload.js";

const normalizeMediaUrl = async (mediaUrl) => {
    if (!mediaUrl) return "";
    if (typeof mediaUrl !== "string") return mediaUrl;

    if (/^https?:\/\//i.test(mediaUrl) && /amazonaws\.com|s3\./i.test(mediaUrl)) {
        return await generatePresignedUrlFromString(mediaUrl);
    }

    return mediaUrl;
};

export const GetAllMedia = async (req, res) => {
    try {
        const response = await MediaUploadModel.find();

        if (!response || response.length === 0) {
            return res.status(404).json({
                message: "Not Found Data"
            });
        }

        const transformedData = await Promise.all(
            response.map(async (item) => {
                const data = item.toObject ? item.toObject() : item;

                if (data.mediaFile) {
                    try {
                        data.mediaFile = await normalizeMediaUrl(data.mediaFile);
                    } catch (err) {
                        console.error("Error normalizing URL:", data.mediaFile, err);
                        // Keep original URL if presigning fails
                    }
                }

                return data;
            })
        );

        return res.status(200).json({
            message: "Data Will Be Find",
            data: transformedData
        });
    } catch (error) {
        console.error("GetAllMedia Error:", error);

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};