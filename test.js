const mongoose = require("mongoose");
const Order = require("./models/Order");
const Booking = require("./models/Booking");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("service", "name price");
    console.log("Orders:", orders.length);

    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("priest", "name phone")
      .populate("service", "name category price")
      .populate("order", "totalAmount status paymentStatus");
    console.log("Bookings:", bookings.length);
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
})
.catch(console.error);
