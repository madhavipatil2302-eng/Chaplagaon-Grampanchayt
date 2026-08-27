import mongoose from "mongoose";

const MediaUploadSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    category: { type: String, trim: true },
    mediaDate: { type: Date },
    description: { type: String, trim: true },
    mediaFile: { type: String, trim: true },
    mediaFileName: { type: String, trim: true },
    mediaMimeType: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application_handler_logins",
    },
  },
  { timestamps: true }
);

const MediaUploadModel = mongoose.model("media_uploads", MediaUploadSchema);

export default MediaUploadModel;
