const Booking = require("../models/Booking");
const Priest = require("../models/Priest");
const User = require("../models/User");
const redis = require("../config/redis");
const {
  bookingBroadcastKey,
  bookingLockKey,
  bookingOtpKey,
  latestAddressKey,
} = require("../utils/redisKeys");
const { generateOTP } = require("../utils/otpGenerator");

/*
CREATE BOOKING + BROADCAST
*/

exports.createBooking = async (data) => {
  const booking = await Booking.create(data);

  const priests = await Priest.find({
    isApproved: true,
    availability: "AVAILABLE",
  }).select("_id name phone");

  const priestIds = priests.map((p) => p._id.toString());

  // Broadcast to all available priests by setting the key to "true"
  // This allows priests who become available after the booking is created to see it
  await redis.set(
    bookingBroadcastKey(booking._id),
    "true",
    "EX",
    86400,
  );

  // Save latest address ID to Redis for auto-fill in future bookings
  if (data.address) {
    await redis.set(
      latestAddressKey(data.user),
      data.address.toString(),
      "EX",
      2592000, // 30 days
    );
  }

  return { booking, priests };
};

/*
PRIEST ACCEPT BOOKING
*/

exports.acceptBooking = async (bookingId, priestId) => {
  const lock = await redis.set(
    bookingLockKey(bookingId),
    priestId,
    "NX",
    "EX",
    300,
  );

  if (!lock) {
    throw new Error("Booking already accepted by another priest");
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Ensure priest is available
  const priest = await Priest.findById(priestId);
  if (!priest || priest.availability !== "AVAILABLE") {
    throw new Error("You must be AVAILABLE to accept a booking");
  }

  // Collision Check: Ensure priest doesn't have another accepted/started booking at the exact same time
  const existingBooking = await Booking.findOne({
    priest: priestId,
    bookingDate: booking.bookingDate,
    status: { $in: ["ACCEPTED", "STARTED"] },
  });

  if (existingBooking) {
    throw new Error(
      "You already have another booking at this exact time and date",
    );
  }

  // Generate OTP for verification at completion
  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  booking.priest = priestId;
  booking.status = "ACCEPTED";
  booking.otp = otp;
  booking.otpExpiresAt = otpExpiresAt;

  await booking.save();

  // Store OTP in user schema as requested
  await User.findByIdAndUpdate(booking.user, {
    currentBookingOtp: otp,
  });

  // Cache OTP in Redis with 24-hour TTL
  await redis.set(bookingOtpKey(bookingId), otp, "EX", 86400);

  // Remove broadcast key so no other priest sees this booking
  await redis.del(bookingBroadcastKey(bookingId));

  // Note: We no longer set availability to BUSY here.
  // The priest stays AVAILABLE to see other broadcasts until the pooja actually STARTS.

  // Return booking without OTP (priest should NOT see it)
  const bookingResponse = booking.toObject();
  delete bookingResponse.otp;
  delete bookingResponse.otpExpiresAt;

  return bookingResponse;
};

/*
START POOJA
*/

exports.startPooja = async (bookingId, priestId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    priest: priestId,
  });

  if (!booking) {
    throw new Error("Booking not assigned to this priest");
  }

  booking.status = "STARTED";

  await booking.save();

  // Mark priest as BUSY only when the pooja starts
  await Priest.findByIdAndUpdate(priestId, {
    availability: "BUSY",
  });

  return booking;
};

/*
COMPLETE POOJA (OTP VERIFIED)
*/

exports.completePooja = async (bookingId, priestId, otp) => {
  if (!otp) {
    throw new Error("OTP is required to complete the pooja");
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    priest: priestId,
  }).select("+otp +otpExpiresAt");

  if (!booking) {
    throw new Error("Booking not assigned to this priest");
  }

  if (booking.status !== "STARTED") {
    throw new Error("Pooja must be started before it can be completed");
  }

  // Check OTP expiry
  if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt) {
    throw new Error("OTP has expired");
  }

  // Verify OTP — check Redis first, fallback to DB
  const cachedOtp = await redis.get(bookingOtpKey(bookingId));
  const storedOtp = cachedOtp || booking.otp;

  if (!storedOtp || storedOtp !== otp) {
    throw new Error("Invalid OTP");
  }

  // OTP verified — complete the booking
  booking.status = "COMPLETED";
  booking.otp = undefined;
  booking.otpExpiresAt = undefined;

  await booking.save();

  // CREDIT REVENUE TO PRIEST
  // Fetch associated order to get the amount
  const populatedBooking = await Booking.findById(bookingId).populate("order");
  if (populatedBooking.order && populatedBooking.order.totalAmount) {
    console.log(`[Revenue] Crediting ₹${populatedBooking.order.totalAmount} to priest ${priestId}`);
    await Priest.findByIdAndUpdate(priestId, {
      $inc: { totalRevenue: populatedBooking.order.totalAmount }
    });
  }

  // Clean up Redis OTP key
  await redis.del(bookingOtpKey(bookingId));

  // Clean up User OTP record
  await User.findByIdAndUpdate(booking.user, {
    $unset: { currentBookingOtp: "" },
  });

  // Set priest back to AVAILABLE for new bookings
  await Priest.findByIdAndUpdate(priestId, {
    availability: "AVAILABLE",
  });

  return booking;
};

/*
GET OTP FOR USER
*/

exports.getBookingOtp = async (bookingId, userId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    user: userId,
  }).select("+otp +otpExpiresAt");

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "ACCEPTED" && booking.status !== "STARTED") {
    throw new Error("OTP is only available for accepted or in-progress bookings");
  }

  if (!booking.otp) {
    throw new Error("No OTP available for this booking");
  }

  return {
    otp: booking.otp,
    expiresAt: booking.otpExpiresAt,
  };
};

/*
GET USER BOOKINGS
*/

exports.getUserBookings = async (userId) => {
  return await Booking.find({ user: userId })
    .select("+otp")
    .populate("user", "currentBookingOtp") // Populate user to get their current OTP
    .populate("service")
    .populate("priest", "name phone")
    .populate("address")
    .populate({
      path: "order",
      populate: {
        path: "products.product",
        model: "Product"
      }
    })
    .sort("-createdAt");
};

/*
CANCEL BOOKING
*/

exports.cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
    throw new Error(`Cannot cancel a booking that is already ${booking.status}`);
  }

  const oldStatus = booking.status;
  booking.status = "CANCELLED";
  await booking.save();

  // If a priest was assigned and the pooja had started, reset priest availability
  if (booking.priest && oldStatus === "STARTED") {
    await Priest.findByIdAndUpdate(booking.priest, {
      availability: "AVAILABLE",
    });
  }

  // Clean up Redis keys if they exist
  await redis.del(bookingBroadcastKey(bookingId));
  await redis.del(bookingLockKey(bookingId));
  await redis.del(bookingOtpKey(bookingId));

  // Clean up User OTP record
  await User.findByIdAndUpdate(booking.user, {
    $unset: { currentBookingOtp: "" },
  });

  return booking;
};
