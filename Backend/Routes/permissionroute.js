import express from "express";

import { getPermissionMatrix, updatePermissionMatrix } from "../Controllers/permissionController.js";
import { VerifyToken } from "../Middleware/auth.js";

const router = express.Router();

router.get("/admin/permissions", VerifyToken, getPermissionMatrix);
router.put("/admin/permissions", VerifyToken, updatePermissionMatrix);

export default router;
