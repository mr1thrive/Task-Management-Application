const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const logAuthEvent = require("../utils/authLog");

// -----------------------------
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// helper to build log context safely
const ctx = (req) => ({
  ip: req.ip,
  method: req.method,
  path: req.originalUrl || req.url,
  userAgent: req.get("user-agent"),
});

// -----------------------------
// REGISTER
// -----------------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      logAuthEvent({
        type: "signup",
        outcome: "failure",
        reason: "missing_fields",
        email,
        ...ctx(req),
        statusCode: 400,
      });

      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      logAuthEvent({
        type: "signup",
        outcome: "failure",
        reason: "duplicate_email",
        email: normalizedEmail,
        ...ctx(req),
        statusCode: 409,
      });

      return res.status(409).json({
        message: "Email already in use.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
    });

    const token = signToken(user._id);

    logAuthEvent({
      type: "signup",
      outcome: "success",
      email: normalizedEmail,
      userId: user._id.toString(),
      ...ctx(req),
      statusCode: 201,
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    logAuthEvent({
      type: "signup",
      outcome: "failure",
      reason: "server_error",
      email: req.body?.email,
      ...ctx(req),
      statusCode: 500,
      errorMessage: err.message,
      errorName: err.name,
      errorCode: err.code,
      errorStack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    });

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// -----------------------------
// LOGIN
// -----------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logAuthEvent({
        type: "login",
        outcome: "failure",
        reason: "missing_fields",
        email,
        ...ctx(req),
        statusCode: 400,
      });

      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      logAuthEvent({
        type: "login",
        outcome: "failure",
        reason: "user_not_found",
        email: normalizedEmail,
        ...ctx(req),
        statusCode: 401,
      });

      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      logAuthEvent({
        type: "login",
        outcome: "failure",
        reason: "bad_password",
        email: normalizedEmail,
        userId: user._id.toString(),
        ...ctx(req),
        statusCode: 401,
      });

      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    const token = signToken(user._id);

    logAuthEvent({
      type: "login",
      outcome: "success",
      email: normalizedEmail,
      userId: user._id.toString(),
      ...ctx(req),
      statusCode: 200,
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    logAuthEvent({
      type: "login",
      outcome: "failure",
      reason: "server_error",
      email: req.body?.email,
      ...ctx(req),
      statusCode: 500,
      errorMessage: err.message,
      errorName: err.name,
      errorCode: err.code,
      errorStack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    });

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// -----------------------------
// FORGOT PASSWORD
// -----------------------------
exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body?.email?.toLowerCase()?.trim();

    const user = await User.findOne({ email });

    if (!user) {
      logAuthEvent({
        type: "forgot_password",
        outcome: "failure",
        reason: "user_not_found",
        email,
        ...ctx(req),
        statusCode: 200,
      });

      return res.json({
        message: "If account exists, reset instructions generated.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetExpires = Date.now() + 3600000;
    await user.save();

    console.log("PASSWORD RESET TOKEN:", token);

    logAuthEvent({
      type: "forgot_password",
      outcome: "success",
      email,
      userId: user._id.toString(),
      ...ctx(req),
      statusCode: 200,
    });

    return res.json({
      message: "Reset token generated. Check server console (dev mode).",
    });
  } catch (err) {
    logAuthEvent({
      type: "forgot_password",
      outcome: "failure",
      reason: "server_error",
      email: req.body?.email,
      ...ctx(req),
      statusCode: 500,
      errorMessage: err.message,
      errorStack: err.stack,
    });

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// -----------------------------
// RECOVER EMAIL
// -----------------------------
exports.recoverEmail = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });

    if (!user) {
      logAuthEvent({
        type: "recover_email",
        outcome: "failure",
        reason: "no_match",
        ...ctx(req),
        statusCode: 200,
      });

      return res.json({
        message: "No matching account found.",
      });
    }

    logAuthEvent({
      type: "recover_email",
      outcome: "success",
      email: user.email,
      userId: user._id.toString(),
      ...ctx(req),
      statusCode: 200,
    });

    return res.json({
      message: `Account email: ${user.email}`,
    });
  } catch (err) {
    logAuthEvent({
      type: "recover_email",
      outcome: "failure",
      reason: "server_error",
      ...ctx(req),
      statusCode: 500,
      errorMessage: err.message,
      errorStack: err.stack,
    });

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// -----------------------------
// CHANGE PASSWORD (Protected)
// PUT /api/auth/change-password
// Body: { currentPassword, newPassword }
// Requires JWT auth middleware -> req.user.id
// -----------------------------
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    // Optional: basic policy (match your frontend rules)
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long.",
      });
    }

    // Load user with password (like your login uses select("+password"))
    // Your login does: User.findOne(...).select("+password") :contentReference[oaicite:3]{index=3}
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password (same method you use in login) :contentReference[oaicite:4]{index=4}
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    // Prevent setting the same password again (recommended)
    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) {
      return res.status(400).json({
        message: "New password must be different from current password.",
      });
    }

    // Hash and save (same hashing style as register) :contentReference[oaicite:5]{index=5}
    user.password = await bcrypt.hash(newPassword, 10);

    // If you store reset token fields, clear them on successful change
    user.resetToken = undefined;
    user.resetExpires = undefined;

    await user.save();

    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
