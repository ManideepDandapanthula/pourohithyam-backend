const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    priest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Priest",
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoojaService",
    },

    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    bookingDate: Date,

    status: {
      type: String,
      enum: ["REQUESTED", "ACCEPTED", "STARTED", "COMPLETED", "CANCELLED"],
      default: "REQUESTED",
    },

    otp: {
      type: String,
      select: false,
    },

    otpExpiresAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
