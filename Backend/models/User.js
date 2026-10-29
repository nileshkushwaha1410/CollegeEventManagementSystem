
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    collegeName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@(aktu\.edu\.in|gmail\.com)$/i,
        "Email must end with @aktu.edu.in or @gmail.com.",
      ],
    },

    mobile: {
      type: String,
      trim: true,
      default: "",
    },

    studentId: {
      type: String,
      trim: true,
      default: "",
    },

    branch: {
      type: String,
      trim: true,
      default: "",
    },

    year: {
      type: String,
      trim: true,
      default: "",
    },

    linkedin: {
      type: String,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    adminApprovalStatus: {
      type: String,
      enum: ["not-required", "pending", "approved", "rejected"],
      default: "not-required",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
