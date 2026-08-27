

import MediaUploadModel from "../Shema/mediaUploadSchema.js";

 export const GetAllMedia= async (req,res)=>{


    try
    {

const  response= await MediaUploadModel.find();


if(!response)
{


    return res.status(404).json({


        message:"Not Found Data"
    })
}

return res.status(200).json({

    message:"Data Will Be Find",

    data:response
})


    }
    catch(error)
    {


        return res.status(500).json({

            message:"Internal Server Error"
        })
    }
}