const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ===============================
// REGISTER OWNER
// ===============================

const registerOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Owner already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "owner",
    });

    res.status(201).json({
      success: true,
      message: "Owner registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register owner",
      error: error.message,
    });
  }
};


// ===============================
// LOGIN OWNER
// ===============================

const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};


// ===============================
// CHANGE OWNER CREDENTIALS
// ===============================

const changeOwnerCredentials = async (req, res) => {
  try {
    const {
      currentPassword,
      newEmail,
      newPassword,
    } = req.body;

    if (!currentPassword || !newEmail || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    if (user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owner can change credentials",
      });
    }

    const isCurrentPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const emailExists = await User.findOne({
      email: newEmail,
      _id: { $ne: user._id },
    });

    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "This email is already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.email = newEmail;
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Owner email and password updated successfully",
    });

  } catch (error) {
    console.error(
      "Change credentials error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update owner credentials",
      error: error.message,
    });
  }
};


module.exports = {
  registerOwner,
  loginOwner,
  changeOwnerCredentials,
};