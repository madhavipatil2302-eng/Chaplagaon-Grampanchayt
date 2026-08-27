
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const Transpoter = nodemailer.createTransport({

    service: "gmail",
    auth: {

        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

export default Transpoter;

