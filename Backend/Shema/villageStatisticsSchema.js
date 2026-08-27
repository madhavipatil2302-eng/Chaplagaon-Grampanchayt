import mongoose from "mongoose";

const VillageStatisticsSchema = new mongoose.Schema(
  {
    totalPopulation: { type: Number, default: 0 },
    malePopulation: { type: Number, default: 0 },
    femalePopulation: { type: Number, default: 0 },
    totalHouseholds: { type: Number, default: 0 },
    areaSqKm: { type: Number, default: 0 },
    literacyRate: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application_handler_logins",
    },
  },
  { timestamps: true }
);

const VillageStatisticsModel = mongoose.model("village_statistics", VillageStatisticsSchema);

export default VillageStatisticsModel;
