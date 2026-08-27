import express from "express";
import { GetEmergencyContact, AddOfficialEmergencyContact, GetOfficialEmergencyContacts, GetAllEmergencyAlerts } from "../Controllers/EmergencyController.js";
import Upload from "../multer/multer.js";

const router = express.Router();

router.post("/emergency-contact", Upload.single("file"), GetEmergencyContact);
router.post("/official-emergency-contact", Upload.single("file"), AddOfficialEmergencyContact);
router.get("/official-emergency-contacts", GetOfficialEmergencyContacts);
router.get("/get-all-emergency-alerts", GetAllEmergencyAlerts);

export default router;
