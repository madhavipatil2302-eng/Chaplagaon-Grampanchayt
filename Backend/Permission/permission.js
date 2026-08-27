import mongoose from "mongoose";

export const permissionRoles = [
  { key: "admin", label: "Admin" },
  { key: "sarpanch", label: "Sarpanch" },
  { key: "deputySarpanch", label: "Deputy Sarpanch" },
  { key: "gramsevak", label: "Gramsevak" },
  { key: "dataEntry", label: "Data Entry" },
  { key: "citizen", label: "Citizen" },
];

export const defaultPermissionModules = [
  {
    moduleKey: "home",
    moduleName: "Home",
    permissions: {
      admin: "CRUD",
      sarpanch: "Allowed",
      deputySarpanch: "Allowed",
      gramsevak: "Allowed",
      dataEntry: "Allowed",
      citizen: "View",
    },
  },
  {
    moduleKey: "panchayatInfo",
    moduleName: "Panchayat Info",
    permissions: {
      admin: "CRUD",
      sarpanch: "View/Edit",
      deputySarpanch: "View",
      gramsevak: "Edit",
      dataEntry: "View",
      citizen: "View",
    },
  },
  {
    moduleKey: "villageStatistics",
    moduleName: "Village Statistics",
    permissions: {
      admin: "CRUD",
      sarpanch: "View",
      deputySarpanch: "View",
      gramsevak: "Edit",
      dataEntry: "Edit",
      citizen: "View",
    },
  },
  {
    moduleKey: "citizenServices",
    moduleName: "Citizen Services",
    permissions: {
      admin: "CRUD",
      sarpanch: "View",
      deputySarpanch: "View",
      gramsevak: "Manage",
      dataEntry: "Create",
      citizen: "View",
    },
  },
  {
    moduleKey: "birthDeathRegistration",
    moduleName: "Birth & Death Registration",
    permissions: {
      admin: "CRUD",
      sarpanch: "Approve",
      deputySarpanch: "View",
      gramsevak: "CRUD",
      dataEntry: "Create",
      citizen: "View",
    },
  },
  {
    moduleKey: "propertyTax",
    moduleName: "Property Tax",
    permissions: {
      admin: "CRUD",
      sarpanch: "View",
      deputySarpanch: "View",
      gramsevak: "CRUD",
      dataEntry: "Entry",
      citizen: "View",
    },
  },
  {
    moduleKey: "waterSupply",
    moduleName: "Water Supply",
    permissions: {
      admin: "CRUD",
      sarpanch: "View",
      deputySarpanch: "View",
      gramsevak: "CRUD",
      dataEntry: "Entry",
      citizen: "View",
    },
  },
  {
    moduleKey: "complaints",
    moduleName: "Complaints",
    permissions: {
      admin: "CRUD",
      sarpanch: "View",
      deputySarpanch: "View",
      gramsevak: "Assign/Resolve",
      dataEntry: "Update",
      citizen: "View",
    },
  },
  {
    moduleKey: "schemes",
    moduleName: "Schemes",
    permissions: {
      admin: "CRUD",
      sarpanch: "Approve",
      deputySarpanch: "View",
      gramsevak: "CRUD",
      dataEntry: "Entry",
      citizen: "View",
    },
  },
  {
    moduleKey: "ongoingProjects",
    moduleName: "Ongoing Projects",
    permissions: {
      admin: "CRUD",
      sarpanch: "Approve",
      deputySarpanch: "Monitor",
      gramsevak: "Update",
      dataEntry: "Entry",
      citizen: "View",
    },
  },
  {
    moduleKey: "mediaUpload",
    moduleName: "Media Upload",
    permissions: {
      admin: "CRUD",
      sarpanch: "Upload",
      deputySarpanch: "Upload",
      gramsevak: "Upload",
      dataEntry: "Upload",
      citizen: "View",
    },
  },
  {
    moduleKey: "gallery",
    moduleName: "Gallery",
    permissions: {
      admin: "CRUD",
      sarpanch: "Upload",
      deputySarpanch: "Upload",
      gramsevak: "Upload",
      dataEntry: "Upload",
      citizen: "View",
    },
  },
  {
    moduleKey: "noticeBoard",
    moduleName: "Notice Board",
    permissions: {
      admin: "CRUD",
      sarpanch: "Publish",
      deputySarpanch: "Publish",
      gramsevak: "Create",
      dataEntry: "Draft",
      citizen: "View",
    },
  },
  {
    moduleKey: "contact",
    moduleName: "Contact",
    permissions: {
      admin: "CRUD",
      sarpanch: "Edit",
      deputySarpanch: "View",
      gramsevak: "Edit",
      dataEntry: "View",
      citizen: "View",
    },
  },
  {
    moduleKey: "roleManagement",
    moduleName: "Role Management",
    permissions: {
      admin: "CRUD",
      sarpanch: "Denied",
      deputySarpanch: "Denied",
      gramsevak: "Denied",
      dataEntry: "Denied",
      citizen: "View",
    },
  },
];

const permissionModuleSchema = new mongoose.Schema(
  {
    moduleKey: {
      type: String,
      required: true,
      trim: true,
    },
    moduleName: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: {
      admin: { type: String, default: "" },
      sarpanch: { type: String, default: "" },
      deputySarpanch: { type: String, default: "" },
      gramsevak: { type: String, default: "" },
      dataEntry: { type: String, default: "" },
      citizen: { type: String, default: "" },
    },
  },
  { _id: false }
);

const permissionMatrixSchema = new mongoose.Schema(
  {
    matrixKey: {
      type: String,
      default: "default",
      unique: true,
      trim: true,
    },
    roles: {
      type: [
        {
          key: { type: String, required: true },
          label: { type: String, required: true },
        },
      ],
      default: permissionRoles,
    },
    modules: {
      type: [permissionModuleSchema],
      default: defaultPermissionModules,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "application_handler_logins",
    },
  },
  { timestamps: true }
);

const PermissionMatrix = mongoose.model("permission_matrices", permissionMatrixSchema);

export default PermissionMatrix;
