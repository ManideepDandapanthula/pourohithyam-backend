const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoojaService",
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],

    totalAmount: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["CREATED", "PAID", "CANCELLED"],
      default: "CREATED",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
