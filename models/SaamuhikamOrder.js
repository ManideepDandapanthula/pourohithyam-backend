const mongoose = require("mongoose");

const saamuhikamOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    saamuhikamPooja: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SaamuhikamPooja",
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      default: "mock_payment_id",
    },
    status: {
      type: String,
      enum: ["PAID", "CANCELLED"],
      default: "PAID",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SaamuhikamOrder", saamuhikamOrderSchema);
