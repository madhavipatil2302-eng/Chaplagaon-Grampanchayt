

import LoginModel from "../Shema/loginSchma.js"
export const GetAllRoleManagement= async(req,res)=>{


    try
    {


        const GetAllRollManagements= await LoginModel.find({
            role: { $exists: true, $ne: "" },
        }).sort({ createdAt: -1 });

        if(!GetAllRollManagements || GetAllRollManagements.length===0)
        {

            return res.status(404).json({

                success:false,
                message:"No Role Managements Found"
            })
        }

        return res.status(200).json({

            success:true,
            data:GetAllRollManagements
        })

    }

    catch(error)
    {


        return res.status(500).json({


            message:"Internal Server Error"
        })
    }
}
