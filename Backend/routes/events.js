
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

// GET: Fetch all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events." });
  }
});

// GET: Fetch one event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: "Invalid event ID." });
  }
});

// POST: Create an event
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, category, date, location, image } = req.body;

    if (!title || !date || !location) {
      return res.status(400).json({
        message: "Title, date, and location are required.",
      });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      location,
      image,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: "Failed to create event." });
  }
});

// PUT: Update an event
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: "Failed to update event." });
  }
});

// DELETE: Delete an event
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json({ message: "Event deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete event." });
  }
});

module.exports = router;
