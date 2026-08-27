import express from "express";

import {
  createMediaUpload,
  createOngoingProject,
  createPanchayatInfo,
  createScheme,
  createVillageStatistics,
  deleteMediaUpload,
  deleteOngoingProject,
  deletePanchayatInfo,
  deleteScheme,
  deleteVillageStatistics,
  getMediaUploads,
  getOngoingProjects,
  getPublicPanchayatInfo,
  getPublicVillageStatistics,
  getPanchayatInfos,
  getSchemes,
  getVillageStatistics,
  updateMediaUpload,
  updateOngoingProject,
  updatePanchayatInfo,
  updateScheme,
  updateVillageStatistics,
} from "../Controllers/moduleDataController.js";
import { VerifyToken } from "../Middleware/auth.js";
import upload from "../Uploadfile/fileupload.js";

const router = express.Router();

router.get("/panchayat-info/latest", getPublicPanchayatInfo);
router.get("/village-statistics/latest", getPublicVillageStatistics);
router.get("/ongoing-projects", getOngoingProjects);
router.get("/media-uploads", getMediaUploads);
router.get("/schemes", getSchemes);

router
  .route("/admin/panchayat-info")
  .get(VerifyToken, getPanchayatInfos)
  .post(VerifyToken, upload.single("panchayatImage"), createPanchayatInfo);
router
  .route("/admin/panchayat-info/:id")
  .put(VerifyToken, upload.single("panchayatImage"), updatePanchayatInfo)
  .delete(VerifyToken, deletePanchayatInfo);

router
  .route("/admin/village-statistics")
  .get(VerifyToken, getVillageStatistics)
  .post(VerifyToken, createVillageStatistics);
router
  .route("/admin/village-statistics/:id")
  .put(VerifyToken, updateVillageStatistics)
  .delete(VerifyToken, deleteVillageStatistics);

router
  .route("/admin/ongoing-projects")
  .get(VerifyToken, getOngoingProjects)
  .post(VerifyToken, upload.single("projectImage"), createOngoingProject);
router
  .route("/admin/ongoing-projects/:id")
  .put(VerifyToken, upload.single("projectImage"), updateOngoingProject)
  .delete(VerifyToken, deleteOngoingProject);

router
  .route("/admin/media-uploads")
  .get(VerifyToken, getMediaUploads)
  .post(VerifyToken, upload.single("mediaFile"), createMediaUpload);
router
  .route("/admin/media-uploads/:id")
  .put(VerifyToken, upload.single("mediaFile"), updateMediaUpload)
  .delete(VerifyToken, deleteMediaUpload);

router
  .route("/admin/schemes")
  .get(VerifyToken, getSchemes)
  .post(VerifyToken, createScheme);
router
  .route("/admin/schemes/:id")
  .put(VerifyToken, updateScheme)
  .delete(VerifyToken, deleteScheme);

export default router;
