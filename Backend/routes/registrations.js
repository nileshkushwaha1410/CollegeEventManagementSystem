
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Student: register for an event
router.post("/:eventId", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can register for events.",
      });
    }

    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    const existing = await Registration.findOne({
      student: req.user.id,
      event: eventId,
    });

    if (existing) {
      if (existing.status === "registered" || existing.status === "attended") {
        return res.status(409).json({
          message: "You already have a registration for this event.",
        });
      }

      existing.status = "registered";
      existing.registeredAt = new Date();
      await existing.save();

      return res.status(200).json({
        message: "Event registration successful.",
        registration: existing,
      });
    }

    const registration = await Registration.create({
      student: req.user.id,
      event: eventId,
    });

    return res.status(201).json({
      message: "Event registration successful.",
      registration,
    });
  } catch (error) {
    console.error("Event registration failed:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have a registration for this event.",
      });
    }

    return res.status(500).json({
      message: "Could not register for this event.",
    });
  }
});

// Student: view their own registrations
router.get("/my", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view student registrations.",
      });
    }

    const registrations = await Registration.find({
      student: req.user.id,
    })
      .populate("event")
      .sort({ registeredAt: -1 });

    return res.status(200).json(registrations);
  } catch (error) {
    console.error("Could not fetch registrations:", error);

    return res.status(500).json({
      message: "Could not load your registrations.",
    });
  }
});

// Student: cancel their own registration
router.patch("/:registrationId/cancel", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can cancel registrations.",
      });
    }

    const { registrationId } = req.params;

    if (!mongoose.isValidObjectId(registrationId)) {
      return res.status(400).json({
        message: "Invalid registration ID.",
      });
    }

    const registration = await Registration.findOne({
      _id: registrationId,
      student: req.user.id,
    });

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found.",
      });
    }

    if (registration.status === "attended") {
      return res.status(400).json({
        message: "An attended event registration cannot be cancelled.",
      });
    }

    if (registration.status === "cancelled") {
      return res.status(400).json({
        message: "This registration is already cancelled.",
      });
    }

    registration.status = "cancelled";
    await registration.save();

    return res.status(200).json({
      message: "Registration cancelled successfully.",
      registration,
    });
  } catch (error) {
    console.error("Registration cancellation failed:", error);

    return res.status(500).json({
      message: "Could not cancel the registration.",
    });
  }
});


 // Admin: view all student registrations
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("student", "name email")
      .populate("event", "title date location category")
      .sort({ registeredAt: -1 });

    return res.status(200).json(registrations);
  } catch (error) {
    console.error("Could not fetch all registrations:", error);

    return res.status(500).json({
      message: "Could not load student registrations.",
    });
  }
});


/* Student: mark attendance for an existing event registration */
router.patch("/:registrationId/attend", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can mark their attendance.",
      });
    }

    const { registrationId } = req.params;

    if (!mongoose.isValidObjectId(registrationId)) {
      return res.status(400).json({
        message: "Invalid registration ID.",
      });
    }

    const registration = await Registration.findOne({
      _id: registrationId,
      student: req.user.id,
    });

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found.",
      });
    }

    if (registration.status === "attended") {
      return res.status(409).json({
        message: "Attendance has already been recorded.",
      });
    }

    if (registration.status !== "registered") {
      return res.status(400).json({
        message: "You must have an active registration to mark attendance.",
      });
    }

    registration.status = "attended";
    await registration.save();

    return res.status(200).json({
      message: "Attendance recorded successfully.",
      registration,
    });
  } catch (error) {
    console.error("Attendance recording failed:", error);

    return res.status(500).json({
      message: "Could not record attendance.",
    });
  }
});


/* Admin: generate a signed attendance QR token for an event */
router.post("/qr/:eventId", protect, adminOnly, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server authentication is not configured.",
      });
    }

    const qrToken = jwt.sign(
      {
        type: "college-event-attendance",
        eventId: String(event._id),
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      message: "Attendance QR generated successfully.",
      qrToken,
    });
  } catch (error) {
    console.error("QR generation failed:", error);

    return res.status(500).json({
      message: "Could not generate attendance QR.",
    });
  }
});


/* Student: verify a signed QR token and record attendance */
router.post("/attendance/scan", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can record attendance.",
      });
    }

    const { qrToken } = req.body;

    if (!qrToken || typeof qrToken !== "string") {
      return res.status(400).json({
        message: "QR token is missing.",
      });
    }

    let payload;

    try {
      payload = jwt.verify(qrToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        message: "QR code is invalid or expired. Ask the admin to generate a new one.",
      });
    }

    if (
      payload.type !== "college-event-attendance" ||
      !mongoose.isValidObjectId(payload.eventId)
    ) {
      return res.status(400).json({
        message: "Invalid attendance QR code.",
      });
    }

    const event = await Event.findById(payload.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    const registration = await Registration.findOne({
      student: req.user.id,
      event: event._id,
    });

    if (!registration || registration.status === "cancelled") {
      return res.status(403).json({
        message: `You are not actively registered for "${event.title}". Attendance was not recorded.`,
      });
    }

    if (registration.status === "attended") {
      return res.status(409).json({
        message: "Attendance has already been recorded.",
      });
    }

    registration.status = "attended";
    await registration.save();

    return res.status(200).json({
      message: `Attendance recorded successfully for "${event.title}"!`,
      registration,
    });
  } catch (error) {
    console.error("QR attendance verification failed:", error);

    return res.status(500).json({
      message: "Could not record attendance.",
    });
  }
});


router.get("/admin/attendance", protect, adminOnly, async (req, res) => {
  try {
    const records = await Registration.find({ status: "attended" })
      .populate("student", "name email")
      .populate("event", "title date location category")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Fetch attendance error:", error);
    res.status(500).json({
      message: "Failed to fetch attendance records.",
    });
  }
});


module.exports = router;
