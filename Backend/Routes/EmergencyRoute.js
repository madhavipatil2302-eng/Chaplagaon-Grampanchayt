import express from "express";
import { GetEmergencyContact, AddOfficialEmergencyContact, GetOfficialEmergencyContacts, GetAllEmergencyAlerts } from "../Controllers/EmergencyController.js";
import upload from "../Uploadfile/fileupload.js";

const router = express.Router();

router.post("/emergency-contact", upload.single("file"), GetEmergencyContact);
router.post("/official-emergency-contact", upload.single("file"), AddOfficialEmergencyContact);
router.get("/official-emergency-contacts", GetOfficialEmergencyContacts);
router.get("/get-all-emergency-alerts", GetAllEmergencyAlerts);

export default router;
