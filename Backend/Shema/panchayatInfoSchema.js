import mongoose from "mongoose";

const PanchayatInfoSchema = new mongoose.Schema(
  {
    gramPanchayatName: { type: String, trim: true },
    villageName: { type: String, trim: true },
    gpCode: { type: String, trim: true },
    establishmentYear: { type: Number },
    panchayatType: { type: String, enum: ["", "Gram", "Nagar"], default: "" },
    registrationNumber: { type: String, trim: true },
    officeAddress: { type: String, trim: true },
    taluka: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pinCode: { type: Number },
    latitude: { type: Number },
    longitude: { type: Number },
    googleMapLink: { type: String, trim: true },
    panchayatImage: { type: String, trim: true },
    panchayatImageName: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application_handler_logins",
    },
  },
  { timestamps: true }
);

const PanchayatInfoModel = mongoose.model("panchayat_infos", PanchayatInfoSchema);

export default PanchayatInfoModel;
