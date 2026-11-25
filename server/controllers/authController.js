
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const validatePortal = (portal, user, res) => {
  if (portal === undefined) return true;
  if (!["user", "admin"].includes(portal)) {
    res.status(400).json({ success: false, message: "Invalid login role" });
    return false;
  }
  if ((portal === "admin") !== (user.role === "admin")) {
    res.status(403).json({ success: false, message: "Account does not have access to the selected login role" });
    return false;
  }
  return true;
};

const createAccessToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d", algorithm: "HS256" }
);


// ================= SIGNUP =================

const signup = async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof mobile !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address"
      });
    }

    if (password.length < 8 || Buffer.byteLength(password) > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and at most 72 bytes"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      mobile,
      password: hashedPassword,
      role: "petOwner"
    });

    return res.status(201).json({
      success: true,
      message: "Registration Successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// ================= LOGIN =================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password"
      });
    }

    if (!validatePortal(req.body.portal, user, res)) return;
    const token = createAccessToken(user);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// ================= GOOGLE LOGIN =================

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (typeof credential !== "string" || !credential.trim()) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required"
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID is missing");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified"
      });
    }

    const normalizedEmail = payload.email.toLowerCase();
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: normalizedEmail }]
    });

    if (!validatePortal(req.body.portal, user || { role: "petOwner" }, res)) return;

    if (user) {
      if (user.googleId && user.googleId !== payload.sub) {
        return res.status(409).json({
          success: false,
          message: "Email is linked to another Google account"
        });
      }

      user.googleId = payload.sub;
      user.avatar = payload.picture || user.avatar;
      await user.save();
    } else {
      user = await User.create({
        fullName: payload.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        authProvider: "google",
        googleId: payload.sub,
        avatar: payload.picture || "",
        role: "petOwner"
      });
    }

    const token = createAccessToken(user);

    return res.status(200).json({
      success: true,
      message: "Google Login Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid Google credential"
    });
  }
};


// ================= GET PROFILE =================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


module.exports = {
  signup,
  login,
  googleLogin,
  getProfile
};
