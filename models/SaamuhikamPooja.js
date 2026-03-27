const mongoose = require("mongoose");

const saamuhikamPoojaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    procedure: {
      type: String,
    },
    benefits: {
      type: String,
    },
    beneficiaries: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    maxParticipants: {
      type: Number,
      default: 0,
    },
    bookedSlots: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SaamuhikamPooja", saamuhikamPoojaSchema);
