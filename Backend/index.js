import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import homeRouter from "./Routes/homerout.js";
import loginRouter from "./Routes/loginroute.js";
import moduleDataRouter from "./Routes/moduleDataRoute.js";
import noticeBoardRouter from "./Routes/noticeBoardRoute.js";
import permissionRouter from "./Routes/permissionroute.js";
import ollamaRouter from "./Routes/Ollama.js";
import notificationRouter from "./Routes/notification.js";
import emergencyRouter from "./Routes/EmergencyRoute.js";
import { seedDefaultAdminAndPermissions } from "./Controllers/OnBording.js";

dotenv.config();

export const app = express();

const PORT = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", true);
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is running.",
  });
});

app.use("/api", loginRouter);
app.use("/api", homeRouter);
app.use("/api", permissionRouter);
app.use("/api", moduleDataRouter);
app.use("/api", noticeBoardRouter);
app.use("/api", ollamaRouter);
app.use("/api", notificationRouter);
app.use("/api", emergencyRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedDefaultAdminAndPermissions();
  })
  .catch((error) => {
    console.log("MongoDB connection error", error.message);
  });

