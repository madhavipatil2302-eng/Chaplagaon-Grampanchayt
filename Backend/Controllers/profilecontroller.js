import LoginModel from "../Shema/loginSchma.js";

function safeProfile(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    alternateMobileNumber: user.alternateMobileNumber,
    role: user.role,
    status: user.status,
    profilePhoto: user.profilePhoto,
  };
}

export const GetProfile = async (req, res) => {
  try {
    const user = await LoginModel.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: safeProfile(user),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const { email, mobileNumber, alternateMobileNumber } = req.body;

    const user = await LoginModel.findByIdAndUpdate(
      req.user?.id,
      {
        email,
        mobileNumber,
        alternateMobileNumber,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: safeProfile(user),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
