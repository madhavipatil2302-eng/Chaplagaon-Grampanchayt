
import OllamaSetup from "../Ollama/Ollama.js";
import OllamaComplint, { AnalyzeComplaintFile } from "../Ollama/OllamaComplint.js";
import { TrackComplint } from "../Controllers/ComplintController.js";
import express from "express";
import Upload from "../multer/multer.js";

const router = express.Router();

router.post("/user-ai", OllamaSetup);
router.post("/complint-file-ai", Upload.single("file"), AnalyzeComplaintFile);
router.post("/complint-ai", Upload.array("files", 5), OllamaComplint);

router.post("/track-complint", TrackComplint);

export default router;
