
const express = require("express");
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const Registration = require("../models/Registration");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Student: submit feedback for a registered event.
router.post("/:eventId", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can submit feedback.",
      });
    }

    const { eventId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID.",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Please select a rating from 1 to 5.",
      });
    }

    if (
      typeof comment !== "string" ||
      !comment.trim() ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Please enter feedback between 1 and 1000 characters.",
      });
    }

    const registration = await Registration.findOne({
      student: req.user.id,
      event: eventId,
      status: { $in: ["registered", "attended"] },
    });

    if (!registration) {
      return res.status(403).json({
        message: "You must be registered for this event to submit feedback.",
      });
    }

    const feedback = await Feedback.create({
      student: req.user.id,
      event: eventId,
      rating,
      comment: comment.trim(),
    });

    return res.status(201).json({
      message: "Feedback submitted successfully.",
      feedback,
    });
  } catch (error) {
    console.error("Feedback submission failed:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already submitted feedback for this event.",
      });
    }

    return res.status(500).json({
      message: "Could not submit feedback.",
    });
  }
});

// Student: view their own feedback.
router.get("/my", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view their feedback.",
      });
    }

    const feedback = await Feedback.find({
      student: req.user.id,
    })
      .populate("event", "title date category")
      .sort({ createdAt: -1 });

    return res.status(200).json(feedback);
  } catch (error) {
    console.error("Could not fetch student feedback:", error);

    return res.status(500).json({
      message: "Could not load feedback.",
    });
  }
});

// Admin: view all submitted feedback.
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("student", "name email")
      .populate("event", "title date category")
      .sort({ createdAt: -1 });

    return res.status(200).json(feedback);
  } catch (error) {
    console.error("Could not fetch all feedback:", error);

    return res.status(500).json({
      message: "Could not load feedback reports.",
    });
  }
});

module.exports = router;
