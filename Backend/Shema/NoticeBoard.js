import mongoose from "mongoose";

const NoticeBoardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "General" },
    noticeType: { type: String, trim: true, default: "Information" },
    expiryDate: { type: Date },
    attachment: { type: String, trim: true, default: "" },
    attachmentName: { type: String, trim: true, default: "" },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application_handler_logins",
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application_handler_logins",
      required: true,
    },
    isPinned: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NoticeBoardModel = mongoose.model("noticeboards", NoticeBoardSchema);

export default NoticeBoardModel;
