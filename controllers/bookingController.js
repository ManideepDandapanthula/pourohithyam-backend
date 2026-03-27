const bookingService = require("../services/bookingService");

/*
USER BOOKS POOJA
*/

exports.createBooking = async (req, res) => {
  try {
    const { service, address, order, bookingDate } = req.body;

    const { booking, priests } = await bookingService.createBooking({
      user: req.user.id,
      service,
      address,
      order,
      bookingDate,
    });

    res.status(201).json({
      success: true,
      message: "Booking created and broadcasted",
      booking,
      availablePriests: priests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
PRIEST ACCEPT BOOKING
*/

exports.acceptBooking = async (req, res) => {
  try {
    const booking = await bookingService.acceptBooking(
      req.params.bookingId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: "Booking accepted. OTP has been generated for the user.",
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
START POOJA
*/

exports.startPooja = async (req, res) => {
  try {
    const booking = await bookingService.startPooja(
      req.params.bookingId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: "Pooja started",
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
COMPLETE POOJA (OTP VERIFIED)
*/

exports.completePooja = async (req, res) => {
  try {
    const { otp } = req.body;

    const booking = await bookingService.completePooja(
      req.params.bookingId,
      req.user.id,
      otp,
    );

    res.status(200).json({
      success: true,
      message: "OTP verified. Pooja completed successfully. Priest is now available.",
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
USER GETS OTP FOR THEIR BOOKING
*/

exports.getBookingOtp = async (req, res) => {
  try {
    const otpData = await bookingService.getBookingOtp(
      req.params.bookingId,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: "Booking OTP retrieved",
      data: otpData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
GET ALL BOOKINGS FOR LOGGED IN USER
*/

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
CANCEL BOOKING
*/

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.cancelBooking(
      req.params.bookingId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
