import mongoose from "mongoose";

const LoginSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    alternateMobileNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    pass: {
      type: String,
    },
    gender: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    villageName: {
      type: String,
      trim: true,
    },
    wardNumber: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: Date,
    },
    termStartDate: {
      type: Date,
    },
    termEndDate: {
      type: Date,
    },
    status: {
      type: String,
      default: "active",
      trim: true,
    },
    responsibilities: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    electionYear: {
      type: String,
      trim: true,
    },
    politicalGroup: {
      type: String,
      trim: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    signature: {
      type: String,
      trim: true,
    },
    priorityProjects: {
      type: [String],
      default: [],
    },
    contact: {
      type: String,
      trim: true,
    },
    valid: {
      type: String,
      trim: true,
    },
    file: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application_handler_logins",
    },
  },
  { timestamps: true }
);



const LoginModel = mongoose.model("application_handler_logins",LoginSchema);


export default LoginModel;
