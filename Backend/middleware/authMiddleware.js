
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

async function adminOnly(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({
        message: "Access denied. Admin permission required.",
      });
    }

    const user = await User.findById(req.user.id);

    if (
      !user ||
      user.role !== "admin" ||
      user.adminApprovalStatus !== "approved"
    ) {
      return res.status(403).json({
        message: "Access denied. Admin approval required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error while checking admin permissions.",
    });
  }
}

module.exports = { protect, adminOnly };
