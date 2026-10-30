
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server authentication configuration is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await User.findById(decoded.id);

    if (
      !admin ||
      admin.role !== "admin" ||
      admin.adminApprovalStatus !== "approved"
    ) {
      return res.status(403).json({
        message: "Access denied. Approved administrator access required.",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired authentication token.",
      });
    }

    console.error("Admin authentication error:", error.message);

    return res.status(500).json({
      message: "Authentication failed.",
    });
  }
}

module.exports = adminAuth;

