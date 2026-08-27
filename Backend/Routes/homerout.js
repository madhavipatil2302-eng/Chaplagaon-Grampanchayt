import express from "express";
import {GetAllRoleManagement} from '../Controllers/homecontroller.js'

const router = express.Router();

router.get("/get-all-role-managements", GetAllRoleManagement);

export default router;

