
import OllamaSetup from "../Ollama/Ollama.js";
import OllamaComplint, { AnalyzeComplaintFile } from "../Ollama/OllamaComplint.js";
import { TrackComplint } from "../Controllers/ComplintController.js";
import express from "express";
import upload from "../Uploadfile/fileupload.js";

const router = express.Router();

router.post("/user-ai", OllamaSetup);
router.post("/complint-file-ai", upload.single("file"), AnalyzeComplaintFile);
router.post("/complint-ai", upload.array("files", 5), OllamaComplint);

router.post("/track-complint", TrackComplint);

export default router;
