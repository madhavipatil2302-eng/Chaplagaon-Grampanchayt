import NoticeBoardModel from "../Shema/NoticeBoard.js";
import { getUploadedFileUrl } from "../Uploadfile/fileupload.js";

const creatorRoles = ["ApplicationAdmin", "GramSevak"];
const approverRoles = ["sarpanch", "UpSarpanch", "DeputySarpanch"];

function userId(req) {
  return req.user?.id || req.user?._id;
}

async function filePath(file) {
  return await getUploadedFileUrl(file);
}

function hasRole(req, roles) {
  return roles.includes(req.user?.role);
}

export const createNotice = async (req, res) => {
  try {
    if (!hasRole(req, creatorRoles)) {
      return res.status(403).json({ success: false, message: "You do not have permission to add notices." });
    }

    const attachment = req.file;
    const data = await NoticeBoardModel.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      noticeType: req.body.noticeType,
      expiryDate: req.body.expiryDate || undefined,
      attachment: await filePath(attachment),
      attachmentName: attachment?.originalname || req.body.attachmentName || "",
      approvalStatus: "Pending",
      createdBy: userId(req),
      isPinned: req.body.isPinned === true || req.body.isPinned === "true",
      isPublished: false,
    });

    return res.status(201).json({ success: true, message: "Notice submitted for approval.", data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getPublicNotices = async (req, res) => {
  try {
    const data = await NoticeBoardModel.find({
      approvalStatus: "Approved",
    })
      .populate("createdBy", "fullName role")
      .populate("approvedBy", "fullName role")
      .sort({ isPinned: -1, createdAt: -1 });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllNotices = async (req, res) => {
  try {
    const filter = hasRole(req, approverRoles) || req.user?.role === "ApplicationAdmin" ? {} : { createdBy: userId(req) };
    const data = await NoticeBoardModel.find(filter)
      .populate("createdBy", "fullName role")
      .populate("approvedBy", "fullName role")
      .sort({ approvalStatus: 1, isPinned: -1, createdAt: -1 });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const approveNotice = async (req, res) => {
  try {
    if (!hasRole(req, approverRoles)) {
      return res.status(403).json({ success: false, message: "Only Sarpanch or Up-Sarpanch can approve notices." });
    }

    const data = await NoticeBoardModel.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "Approved",
        approvedBy: userId(req),
        approvedAt: new Date(),
        rejectionReason: "",
        isPublished: true,
      },
      { new: true, runValidators: true }
    );

    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Notice approved and published." : "Notice not found.",
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const rejectNotice = async (req, res) => {
  try {
    if (!hasRole(req, approverRoles)) {
      return res.status(403).json({ success: false, message: "Only Sarpanch or Up-Sarpanch can reject notices" });
    }

    const data = await NoticeBoardModel.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "Rejected",
        approvedBy: userId(req),
        approvedAt: new Date(),
        rejectionReason: req.body.rejectionReason || "Rejected",
        isPublished: false,
      },
      { new: true, runValidators: true }
    );

    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Notice rejected." : "Notice not found.",
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
