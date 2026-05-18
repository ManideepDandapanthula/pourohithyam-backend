const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    paymentId: String,
    
    razorpayOrderId: String,
    
    razorpayPaymentId: String,

    amount: Number,

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    method: {
      type: String,
      default: "ONLINE",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
