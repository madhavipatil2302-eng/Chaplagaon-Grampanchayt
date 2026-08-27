

import jwt from "jsonwebtoken"
/* Verify Token  */
export const VerifyToken =(req,res,next)=>{


    try
    {

        const token = req.headers.authorization?.split(" ")[1];

        if(!token)
        {


            return res.status(401).json({


                message:"Access Denied .No token Provided"
            })
        }

        const decoded= jwt.verify(token,process.env.JWT_SECRET_KEY);

        req.user=decoded;
        return next();


    }
    catch(err)
    {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });

    }


}
