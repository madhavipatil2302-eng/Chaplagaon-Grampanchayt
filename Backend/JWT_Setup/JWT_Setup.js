
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


const Secrete_KEY = process.env.JWT_SECRET_KEY;

export const GenrateJWTToken = async (user) => {


    return jwt.sign({ id: user._id, email: user.email, role: user.role }, Secrete_KEY, { expiresIn: "1d" });
}


export const VerifyJwtAccessToken = async (req, res, next) => {

    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token is not found or invalid format"
            })
        }

        const token = authHeader.split(" ")[1];

        const decodedToken = jwt.verify(token, Secrete_KEY);
        req.user = decodedToken;

        next();

    }
    catch (error) {

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        })
    }

}