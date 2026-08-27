import express from "express";

import {
  approveNotice,
  createNotice,
  getAllNotices,
  getPublicNotices,
  rejectNotice,
} from "../Controllers/noticeBoardController.js";
import { VerifyToken } from "../Middleware/auth.js";
import upload from "../Uploadfile/fileupload.js";

const router = express.Router();

router.get("/notices", getPublicNotices);
router.get("/admin/notices", VerifyToken, getAllNotices);
router.post("/admin/notices", VerifyToken, upload.single("attachment"), createNotice);
router.patch("/admin/notices/:id/approve", VerifyToken, approveNotice);
router.patch("/admin/notices/:id/reject", VerifyToken, rejectNotice);

export default router;
