import mongoose from "mongoose";

const SchemeSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true, trim: true },
    schemeCode: { type: String, trim: true },
    category: { type: String, trim: true },
    department: { type: String, trim: true },
    description: { type: String, trim: true },
    benefits: { type: String, trim: true },
    eligibility: { type: String, trim: true },
    requiredDocuments: { type: [String], default: [] },
    applicationMode: { type: String, enum: ["", "Online", "Offline", "Both"], default: "" },
    applicationLink: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ["Active", "Inactive", "Closed"], default: "Active" },
    contactPerson: { type: String, trim: true },
    mobile: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    priority: { type: String, enum: ["", "Low", "Medium", "High"], default: "" },
    targetGroup: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application_handler_logins",
    },
  },
  { timestamps: true }
);

const SchemeModel = mongoose.model("schemes", SchemeSchema);

export default SchemeModel;
