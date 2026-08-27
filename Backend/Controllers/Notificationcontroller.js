
import ComplintModel from "../Shema/Complient.js";

export const GetAllNotificationComplints = async (req, res) => {


    try {

        const GetAllNotificationComplints = await ComplintModel.find();
        if (!GetAllNotificationComplints) {

            return res.status(404).json({

                message: "Not Found Data"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Data Will Be Find",
            data: GetAllNotificationComplints
        })


    }

    catch (error) {

        return res.status(500).json({

            message: "Internal Server Error"
        })
    }
}

export const ViewNotificationById = async (req, res) => {


    try {

        const { id } = req.params


        const FindComplent = await ComplintModel.findById(id);

        if (!FindComplent) {
            return res.status(404).json({


                message: "Not Found Data"
            })
        }

        return res.status(200).json({

            success: true,
            message: "Data Find Successfully",
            data: FindComplent
        })


    }
    catch (error) {


        return res.status(500).json({


            message: "Internal Server Error"
        })

    }

}

export const SetApproveNotification = async (req, res) => {


    try {


        const { id } = req.params;
        const { status } = req.body;

        const FindNotificationUpdatestatus = await ComplintModel.findByIdAndUpdate(
            id,
            { $set: { status: status } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Status Update Successfully",
            data: FindNotificationUpdatestatus
        })

    }
    catch (error) {


        return res.status(500).json({


            message: "Internal Server Error"
        })
    }

}