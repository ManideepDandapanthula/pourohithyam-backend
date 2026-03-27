const mongoose = require("mongoose");

const poojaServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: String,

    category: {
      type: String,
      enum: ["VAISHNAVA", "SHAIVA"],
    },

    price: {
      type: Number,
      required: true,
    },

    materials: [
      {
        type: String,
      },
    ],
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PoojaService", poojaServiceSchema);
