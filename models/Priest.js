const mongoose = require("mongoose");

const priestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: String,

    experience: {
      type: Number,
    },

    languages: [String],

    specialization: [String],

    isApproved: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    availability: {
      type: String,
      enum: ["OFFLINE", "AVAILABLE", "BUSY"],
      default: "AVAILABLE",
    },
    role: {
      type: String,
      default: "PRIEST",
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Priest", priestSchema);
