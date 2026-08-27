import MediaUploadModel from "../Shema/mediaUploadSchema.js";
import OngoingProjectModel from "../Shema/ongoingProjectSchema.js";
import PanchayatInfoModel from "../Shema/panchayatInfoSchema.js";
import SchemeModel from "../Shema/schemeSchema.js";
import VillageStatisticsModel from "../Shema/villageStatisticsSchema.js";

function asNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
}

function asDate(value) {
  return value ? value : undefined;
}

function filePath(file) {
  return file ? `/uploads/${file.filename}` : "";
}

function assetUrl(req, pathValue) {
  if (!pathValue || /^https?:\/\//i.test(pathValue)) {
    return pathValue || "";
  }

  const normalizedPath = pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
  const publicBaseUrl = process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/+$/, "")}${normalizedPath}`;
  }

  const protocol = req.get("x-forwarded-proto") || req.protocol;
  const host = req.get("x-forwarded-host") || req.get("host");
  return `${protocol}://${host}${normalizedPath}`;
}

function asPlainObject(data) {
  return data?.toObject ? data.toObject() : data;
}

function withAssetUrls(req, data, fields) {
  if (!data) {
    return data;
  }

  const item = asPlainObject(data);

  fields.forEach((field) => {
    if (item[field]) {
      item[field] = assetUrl(req, item[field]);
    }
  });

  return item;
}

function withAssetUrlsList(req, data, fields) {
  return data.map((item) => withAssetUrls(req, item, fields));
}

function userId(req) {
  return req.user?.id || req.user?._id;
}

function parseRequiredDocuments(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return String(value)
      .split("\n")
      .map((document) => document.trim())
      .filter(Boolean);
  }
}

async function removeOldPanchayatInfoExcept(id) {
  if (id) {
    await PanchayatInfoModel.deleteMany({ _id: { $ne: id } });
  }
}

async function removeOldVillageStatisticsExcept(id) {
  if (id) {
    await VillageStatisticsModel.deleteMany({ _id: { $ne: id } });
  }
}

export const createPanchayatInfo = async (req, res) => {
  try {
    const panchayatImage = req.file;
    const existingInfo = await PanchayatInfoModel.findOne().sort({ createdAt: -1 });
    const payload = {
      ...req.body,
      establishmentYear: asNumber(req.body.establishmentYear),
      pinCode: asNumber(req.body.pinCode),
      latitude: asNumber(req.body.latitude),
      longitude: asNumber(req.body.longitude),
      createdBy: userId(req),
    };

    if (panchayatImage) {
      payload.panchayatImage = filePath(panchayatImage);
      payload.panchayatImageName = panchayatImage.originalname;
    }

    const data = existingInfo
      ? await PanchayatInfoModel.findByIdAndUpdate(existingInfo._id, payload, { new: true, runValidators: true })
      : await PanchayatInfoModel.create(payload);

    await removeOldPanchayatInfoExcept(data._id);

    return res.status(201).json({
      success: true,
      message: "Panchayat information saved successfully.",
      data: withAssetUrls(req, data, ["panchayatImage"]),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getPanchayatInfos = async (req, res) => {
  try {
    const latestInfo = await PanchayatInfoModel.findOne().sort({ createdAt: -1 });

    if (latestInfo) {
      await removeOldPanchayatInfoExcept(latestInfo._id);
    }

    return res.status(200).json({
      success: true,
      data: latestInfo ? [withAssetUrls(req, latestInfo, ["panchayatImage"])] : [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getPublicPanchayatInfo = async (req, res) => {
  try {
    const data = await PanchayatInfoModel.findOne().sort({ createdAt: -1 });
    if (data) {
      await removeOldPanchayatInfoExcept(data._id);
    }

    return res.status(200).json({ success: true, data: withAssetUrls(req, data, ["panchayatImage"]) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updatePanchayatInfo = async (req, res) => {
  try {
    const panchayatImage = req.file;
    const updateData = {
      ...req.body,
      establishmentYear: asNumber(req.body.establishmentYear),
      pinCode: asNumber(req.body.pinCode),
      latitude: asNumber(req.body.latitude),
      longitude: asNumber(req.body.longitude),
    };

    if (panchayatImage) {
      updateData.panchayatImage = filePath(panchayatImage);
      updateData.panchayatImageName = panchayatImage.originalname;
    }

    const data = await PanchayatInfoModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Panchayat information updated successfully." : "Panchayat information not found.",
      data: withAssetUrls(req, data, ["panchayatImage"]),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deletePanchayatInfo = async (req, res) => {
  try {
    const data = await PanchayatInfoModel.findByIdAndDelete(req.params.id);
    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Panchayat information deleted successfully." : "Panchayat information not found.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createVillageStatistics = async (req, res) => {
  try {
    const existingStatistics = await VillageStatisticsModel.findOne().sort({ createdAt: -1 });
    const payload = {
      totalPopulation: asNumber(req.body.totalPopulation),
      malePopulation: asNumber(req.body.malePopulation),
      femalePopulation: asNumber(req.body.femalePopulation),
      totalHouseholds: asNumber(req.body.totalHouseholds),
      areaSqKm: asNumber(req.body.areaSqKm),
      literacyRate: asNumber(req.body.literacyRate),
      createdBy: userId(req),
    };

    const data = existingStatistics
      ? await VillageStatisticsModel.findByIdAndUpdate(existingStatistics._id, payload, { new: true, runValidators: true })
      : await VillageStatisticsModel.create(payload);

    await removeOldVillageStatisticsExcept(data._id);

    return res.status(201).json({ success: true, message: "Village statistics saved successfully.", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getVillageStatistics = async (req, res) => {
  try {
    const latestStatistics = await VillageStatisticsModel.findOne().sort({ createdAt: -1 });

    if (latestStatistics) {
      await removeOldVillageStatisticsExcept(latestStatistics._id);
    }

    return res.status(200).json({ success: true, data: latestStatistics ? [latestStatistics] : [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getPublicVillageStatistics = async (req, res) => {
  try {
    const data = await VillageStatisticsModel.findOne().sort({ createdAt: -1 });

    if (data) {
      await removeOldVillageStatisticsExcept(data._id);
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateVillageStatistics = async (req, res) => {
  try {
    const data = await VillageStatisticsModel.findByIdAndUpdate(
      req.params.id,
      {
        totalPopulation: asNumber(req.body.totalPopulation),
        malePopulation: asNumber(req.body.malePopulation),
        femalePopulation: asNumber(req.body.femalePopulation),
        totalHouseholds: asNumber(req.body.totalHouseholds),
        areaSqKm: asNumber(req.body.areaSqKm),
        literacyRate: asNumber(req.body.literacyRate),
      },
      { new: true, runValidators: true }
    );

    if (data) {
      await removeOldVillageStatisticsExcept(data._id);
    }

    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Village statistics updated successfully." : "Village statistics not found.",
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteVillageStatistics = async (req, res) => {
  try {
    const data = await VillageStatisticsModel.findByIdAndDelete(req.params.id);
    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Village statistics deleted successfully." : "Village statistics not found.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createOngoingProject = async (req, res) => {
  try {
    const projectImage = req.file;
    const data = await OngoingProjectModel.create({
      ...req.body,
      startDate: asDate(req.body.startDate),
      expectedEndDate: asDate(req.body.expectedEndDate),
      budgetAmount: asNumber(req.body.budgetAmount),
      sanctionedAmount: asNumber(req.body.sanctionedAmount),
      completionPercent: asNumber(req.body.completionPercent),
      projectImage: filePath(projectImage),
      projectImageName: projectImage?.originalname || req.body.projectImageName || "",
      createdBy: userId(req),
    });

    return res.status(201).json({
      success: true,
      message: "Ongoing project saved successfully.",
      data: withAssetUrls(req, data, ["projectImage"]),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getOngoingProjects = async (req, res) => {
  try {
    const data = await OngoingProjectModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: withAssetUrlsList(req, data, ["projectImage"]) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateOngoingProject = async (req, res) => {
  try {
    const projectImage = req.file;
    const updateData = {
      ...req.body,
      startDate: asDate(req.body.startDate),
      expectedEndDate: asDate(req.body.expectedEndDate),
      budgetAmount: asNumber(req.body.budgetAmount),
      sanctionedAmount: asNumber(req.body.sanctionedAmount),
      completionPercent: asNumber(req.body.completionPercent),
    };

    if (projectImage) {
      updateData.projectImage = filePath(projectImage);
      updateData.projectImageName = projectImage.originalname;
    }

    const data = await OngoingProjectModel.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Ongoing project updated successfully." : "Ongoing project not found.",
      data: withAssetUrls(req, data, ["projectImage"]),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteOngoingProject = async (req, res) => {
  try {
    const data = await OngoingProjectModel.findByIdAndDelete(req.params.id);
    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Ongoing project deleted successfully." : "Ongoing project not found.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createMediaUpload = async (req, res) => {
  try {
    const mediaFile = req.file;
    const data = await MediaUploadModel.create({
      ...req.body,
      mediaDate: asDate(req.body.mediaDate),
      mediaFile: filePath(mediaFile),
      mediaFileName: mediaFile?.originalname || req.body.mediaFileName || "",
      mediaMimeType: mediaFile?.mimetype || "",
      createdBy: userId(req),
    });

    return res.status(201).json({
      success: true,
      message: "Media saved successfully.",
      data: withAssetUrls(req, data, ["mediaFile"]),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getMediaUploads = async (req, res) => {
  try {
    const data = await MediaUploadModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: withAssetUrlsList(req, data, ["mediaFile"]) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateMediaUpload = async (req, res) => {
  try {
    const mediaFile = req.file;
    const updateData = {
      ...req.body,
      mediaDate: asDate(req.body.mediaDate),
    };

    if (mediaFile) {
      updateData.mediaFile = filePath(mediaFile);
      updateData.mediaFileName = mediaFile.originalname;
      updateData.mediaMimeType = mediaFile.mimetype;
    }

    const data = await MediaUploadModel.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Media updated successfully." : "Media not found.",
      data: withAssetUrls(req, data, ["mediaFile"]),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteMediaUpload = async (req, res) => {
  try {
    const data = await MediaUploadModel.findByIdAndDelete(req.params.id);
    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Media deleted successfully." : "Media not found.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createScheme = async (req, res) => {
  try {
    const data = await SchemeModel.create({
      ...req.body,
      requiredDocuments: parseRequiredDocuments(req.body.requiredDocuments),
      startDate: asDate(req.body.startDate),
      endDate: asDate(req.body.endDate),
      featured: req.body.featured === true || req.body.featured === "true",
      createdBy: userId(req),
    });

    return res.status(201).json({ success: true, message: "Scheme saved successfully.", data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getSchemes = async (req, res) => {
  try {
    const data = await SchemeModel.find().sort({ featured: -1, createdAt: -1 });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getSchemes:", error);
    return res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

export const updateScheme = async (req, res) => {
  try {
    const data = await SchemeModel.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        requiredDocuments: parseRequiredDocuments(req.body.requiredDocuments),
        startDate: asDate(req.body.startDate),
        endDate: asDate(req.body.endDate),
        featured: req.body.featured === true || req.body.featured === "true",
      },
      { new: true, runValidators: true }
    );

    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Scheme updated successfully." : "Scheme not found.",
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteScheme = async (req, res) => {
  try {
    const data = await SchemeModel.findByIdAndDelete(req.params.id);
    return res.status(data ? 200 : 404).json({
      success: Boolean(data),
      message: data ? "Scheme deleted successfully." : "Scheme not found.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
