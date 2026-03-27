const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const protect = require("../middlewares/authMiddleware");

/*
USER BOOKING
*/

router.post("/create", protect, bookingController.createBooking);

/*
PRIEST ACCEPT BOOKING
*/

router.post("/accept/:bookingId", protect, bookingController.acceptBooking);

/*
START POOJA
*/

router.post("/start/:bookingId", protect, bookingController.startPooja);

/*
COMPLETE POOJA
*/

router.post("/complete/:bookingId", protect, bookingController.completePooja);

/*
USER GET OTP
*/

router.get("/otp/:bookingId", protect, bookingController.getBookingOtp);

/*
USER GET ALL THEIR BOOKINGS
*/
router.get("/my-bookings", protect, bookingController.getUserBookings);

/*
CANCEL BOOKING
*/
router.post("/cancel/:bookingId", protect, bookingController.cancelBooking);

module.exports = router;
