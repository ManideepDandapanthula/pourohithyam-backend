require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const priestRoutes = require("./routes/priestRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const productRoutes = require("./routes/productRoutes"); // Added
const saamuhikamRoutes = require("./routes/saamuhikamRoutes");

const app = express();

// connectDB();
mongoose
  .connect("mongodb://127.0.0.1:27017/purohythiam")
  .then(() => {
    console.log("Connected to the Database");
  })
  .catch((err) => {
    console.log("There was an error wile connecting ot the database.....");
  });
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("PujaKart Backend Running");
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/priest", priestRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/products", productRoutes); // Added
app.use("/api/saamuhikam", saamuhikamRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`POrt running on http://localhost:${PORT}`);
});
