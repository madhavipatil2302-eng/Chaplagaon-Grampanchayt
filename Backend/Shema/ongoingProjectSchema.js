import mongoose from "mongoose";

const OngoingProjectSchema = new mongoose.Schema(
  {
    projectName: { type: String, trim: true },
    projectType: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date },
    expectedEndDate: { type: Date },
    budgetAmount: { type: Number, default: 0 },
    sanctionedAmount: { type: Number, default: 0 },
    contractorName: { type: String, trim: true },
    projectStatus: { type: String, trim: true },
    completionPercent: { type: Number, default: 0 },
    description: { type: String, trim: true },
    projectImage: { type: String, trim: true },
    projectImageName: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application_handler_logins",
    },
  },
  { timestamps: true }
);

const OngoingProjectModel = mongoose.model("ongoing_projects", OngoingProjectSchema);

export default OngoingProjectModel;
