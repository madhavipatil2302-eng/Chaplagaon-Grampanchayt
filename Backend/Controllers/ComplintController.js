import ComplintModel from "../Shema/Complient.js";


export const AddComplint = async (complaintData) => {
    if (!complaintData) {
        throw new Error("Complaint data is required");
    }

    const response = await ComplintModel.create({
        complint: complaintData.complint,
        complaintName: complaintData.complaintName,
        description: complaintData.description,
        category: complaintData.category,
        name: complaintData.name,
        email: complaintData.email,
        phone: complaintData.contact,
        file: complaintData.file,
        files: complaintData.files,
        aiResponse: complaintData.aiResponse,
        token: complaintData.token,
    });

    return response;
}
export const TrackComplint = async (req, res) => {


    try {

        const { token } = req.body;

        if (!token) {

            return res.status(401).json({


                message: "Token Is Invalid"
            })
        }

        const response = await ComplintModel.findOne({ token })

        if (!response) {

            return res.status(404).json({


                message: "Token Not Found"
            })
        }

        return res.status(200).json({

            message: "Token Is Valid",
            data: response
        })


    }
    catch (err) {

        return res.status(500).json({


            message: "Internal Server Error",
            error: err.message
        })
    }


}
