import LoginModel from "../Shema/loginSchma.js";
import { GenrateJWTToken } from "../JWT_Setup/JWT_Setup.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function isActiveAccount(user) {
  const status = String(user.status || "").trim().toLowerCase();
  const valid = String(user.valid || "").trim().toLowerCase();

  return !status || status === "active" || valid === "active" || valid === "true" || valid === "valid";
}

function getSavedPassword(user) {
  return user.password || user.pass || "";
}

function sendSafeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    profilePhoto: user.profilePhoto,
  };
}

export const EmailVirify = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    const user = await LoginModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not found.",
      });
    }

    if (!isActiveAccount(user)) {
      return res.status(403).json({
        success: false,
        message: "This account is not active.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      user: sendSafeUser(user),
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const AdminLogin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter password.",
      });
    }

    const user = await LoginModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not found.",
      });
    }

    if (!isActiveAccount(user)) {
      return res.status(403).json({
        success: false,
        message: "This account is not active.",
      });
    }

    if (getSavedPassword(user) !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    const token = await GenrateJWTToken(user);

    // if (!process.env.JWT_SECRET_KEY) {
    //   return res.status(500).json({
    //     success: false,
    //     message: "JWT secret key is not configured.",
    //   });
    // }

    // const token = jwt.sign(
    //   { id: user._id, email: user.email, role: user.role },
    //   process.env.JWT_SECRET_KEY,
    //   { expiresIn: "1h" }
    // );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      user: sendSafeUser(user),
      token
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
