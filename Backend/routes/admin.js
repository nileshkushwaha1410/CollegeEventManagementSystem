
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// GET ALL PENDING COLLEGE REQUESTS
router.get("/colleges/pending", adminAuth, async (req, res) => {
  try {
    const colleges = await User.find({
      collegeName: { $exists: true, $ne: "" },
      adminApprovalStatus: "pending",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: colleges.length,
      colleges,
    });
  } catch (error) {
    console.error("Fetch college requests error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch college requests.",
    });
  }
});

// APPROVE COLLEGE REQUEST
router.patch("/colleges/:id/approve", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid college account ID.",
      });
    }

    const college = await User.findOneAndUpdate(
      {
        _id: id,
        collegeName: { $exists: true, $ne: "" },
        adminApprovalStatus: "pending",
      },
      {
        $set: {
          role: "admin",
          adminApprovalStatus: "approved",
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!college) {
      return res.status(404).json({
        message: "Pending college request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "College account approved successfully.",
      college,
    });
  } catch (error) {
    console.error("Approve college error:", error.message);

    return res.status(500).json({
      message: "Unable to approve college account.",
    });
  }
});

// REJECT COLLEGE REQUEST
router.patch("/colleges/:id/reject", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid college account ID.",
      });
    }

    const college = await User.findOneAndUpdate(
      {
        _id: id,
        collegeName: { $exists: true, $ne: "" },
        adminApprovalStatus: "pending",
      },
      {
        $set: {
          role: "student",
          adminApprovalStatus: "rejected",
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!college) {
      return res.status(404).json({
        message: "Pending college request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "College account rejected successfully.",
      college,
    });
  } catch (error) {
    console.error("Reject college error:", error.message);

    return res.status(500).json({
      message: "Unable to reject college account.",
    });
  }
});

module.exports = router;

