import express from "express";
import { AdminLogin, EmailVirify } from "../Controllers/logincontroller.js";
import { OnboardingController } from "../Controllers/OnBording.js";
import { GetProfile, UpdateProfile } from "../Controllers/profilecontroller.js";
import { roleManagement } from "../Controllers/roleManagement.js";
import { VerifyToken } from "../Middleware/auth.js";
import upload from "../Uploadfile/fileupload.js";

const router = express.Router();

router.post("/admin/onboarding", OnboardingController);
router.post("/admin/verify-email", EmailVirify);
router.post("/admin/login", AdminLogin);
router.get("/admin/profile", VerifyToken, GetProfile);
router.patch("/admin/profile", VerifyToken, UpdateProfile);
router.post(
  "/admin/manage-role",
  VerifyToken,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  roleManagement
);

// Old route kept for testing/backward compatibility.
router.post("/login/emailverify", EmailVirify);

export default router;

