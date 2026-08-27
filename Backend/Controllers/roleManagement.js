import LoginModel from "../Shema/loginSchma.js";

function parsePriorityProjects(value) {
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
      .map((project) => project.trim())
      .filter(Boolean);
  }
}

function filePath(file) {
  return file ? `/uploads/${file.filename}` : "";
}

export const roleManagement = async (req, res) => {
  try {
    const {
      fullName,
      role,
      mobileNumber,
      alternateMobileNumber,
      email,
      gender,
      dateOfBirth,
      address,
      villageName,
      wardNumber,
      education,
      occupation,
      joiningDate,
      termStartDate,
      termEndDate,
      status,
      responsibilities,
      bio,
      electionYear,
      politicalGroup,
      totalVotes,
      priorityProjects,
      pass,
    } = req.body;

    if (!fullName || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name and role are required.",
      });
    }

    const profilePhotoFile = req.files?.profilePhoto?.[0];
    const signatureFile = req.files?.signature?.[0];

    const roleDetails = await LoginModel.create({
      fullName,
      role,
      profilePhoto: filePath(profilePhotoFile),
      mobileNumber,
      alternateMobileNumber,
      email,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      address,
      villageName,
      wardNumber,
      education,
      occupation,
      joiningDate: joiningDate || undefined,
      termStartDate: termStartDate || undefined,
      termEndDate: termEndDate || undefined,
      status,
      responsibilities,
      bio,
      electionYear,
      politicalGroup,
      totalVotes: totalVotes ? Number(totalVotes) : 0,
      signature: filePath(signatureFile),
      priorityProjects: parsePriorityProjects(priorityProjects),
      pass,
      createdBy: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: "Role details saved successfully.",
      data: roleDetails,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
