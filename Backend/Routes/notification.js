import express from "express";
import { GetAllNotificationComplints, SetApproveNotification, ViewNotificationById } from "../Controllers/Notificationcontroller.js";
import { VerifyJwtAccessToken } from "../JWT_Setup/JWT_Setup.js";


const router = express.Router();

router.get("/get-all-notification-complints", VerifyJwtAccessToken, GetAllNotificationComplints);

router.get("/get-notificationbyId/:id", ViewNotificationById);
router.patch("/status/:id", SetApproveNotification);

export default router;