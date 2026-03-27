const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      trim: true
      // e.g. "06:00 AM"
    },

    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);


module.exports = mongoose.model("TimeSlot", timeSlotSchema, "timeSlots");
