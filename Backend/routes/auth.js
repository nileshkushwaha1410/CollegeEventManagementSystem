
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const isAllowedEmail = (email) =>
  /^[^\s@]+@(aktu\.edu\.in|gmail\.com)$/i.test(email);

const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);

// SIGNUP
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      collegeName,
      email,
      mobile,
      studentId,
      branch,
      year,
      linkedin,
      password,
      confirmPassword,
      role,
    } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isAllowedEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Use an @aktu.edu.in or @gmail.com email address.",
      });
    }

    if (!isValidMobile(mobile)) {
      return res.status(400).json({
        message: "Enter a valid 10-digit Indian mobile number.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (role !== "student" && role !== "admin") {
      return res.status(400).json({
        message: "Please select a valid account type.",
      });
    }

    if (role === "student" && (!studentId || !branch || !year)) {
      return res.status(400).json({
        message: "Student ID, branch, and year are required.",
      });
    }

    if (role === "admin" && !collegeName?.trim()) {
      return res.status(400).json({
        message: "College full name is required.",
      });
    }

    if (linkedin && !/^https?:\/\/.+/i.test(linkedin)) {
      return res.status(400).json({
        message: "Enter a valid LinkedIn profile URL beginning with https:// or http://.",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Public college signup creates a pending request, not an admin.
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: role === "admin" ? collegeName.trim() : name.trim(),
      collegeName: role === "admin" ? collegeName.trim() : "",
      email: normalizedEmail,
      mobile: mobile.trim(),
      studentId: role === "student" ? studentId.trim() : "",
      branch: role === "student" ? branch.trim() : "",
      year: role === "student" ? String(year) : "",
      linkedin: role === "student" ? (linkedin || "").trim() : "",
      password: hashedPassword,

      // Never grant admin privileges through public signup.
      role: "student",
      adminApprovalStatus: role === "admin" ? "pending" : "not-required",
    });

    return res.status(201).json({
      message:
        role === "admin"
          ? "College account request submitted. Admin access requires approval."
          : "Student registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminApprovalStatus: user.adminApprovalStatus,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed.",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, accountType } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    if (accountType !== "student" && accountType !== "admin") {
      return res.status(400).json({
        message: "Please select Student or Admin/College login.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Pending college accounts must not receive admin access.
    
    if (user.adminApprovalStatus === "pending") {
      return res.status(403).json({
        message:
          "Your college account request is awaiting approval.",
      });
    }

    if (user.adminApprovalStatus === "rejected") {
      return res.status(403).json({
        message:
          "Your college account request was not approved.",
      });
    }

    if (accountType === "admin") {
      if (
        user.role !== "admin" ||
        user.adminApprovalStatus !== "approved"
      ) {
        return res.status(403).json({
          message:
            "This account does not have approved admin access.",
        });
      }
    } else if (user.role !== "student") {
      return res.status(403).json({
        message:
          "Please use the Admin/College login option.",
      });
    }


    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from the server environment.");

      return res.status(500).json({
        message: "Server authentication configuration is missing.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        studentId: user.studentId,
        branch: user.branch,
        year: user.year,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
});

module.exports = router;
