const mongoose = require("mongoose");
const Priest = require("../models/Priest");
const redis = require("../config/redis");
const Booking = require("../models/Booking");
const { bookingBroadcastKey } = require("../utils/redisKeys");

const BROADCAST_PREFIX = "booking:broadcast:";

exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const priest = await Priest.findById(req.user.id);

    if (!priest) {
      return res.status(404).json({
        success: false,
        message: "Priest not found. Make sure you are logged in as a priest.",
      });
    }

    priest.availability = availability;

    await priest.save();

    res.status(200).json({
      success: true,
      message: "Availability updated",
      data: priest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getBroadcastBookings = async (req, res) => {
  try {
    const priestId = req.user.id;
    console.log(`[BroadcastBookings] Fetching for priest: ${priestId}`);

    // Only AVAILABLE priests can see broadcasted bookings
    const priest = await Priest.findById(priestId);

    if (!priest) {
      return res.status(403).json({
        success: false,
        message: "Priest profile not found.",
      });
    }

    if (priest.availability === "OFFLINE") {
      return res.status(200).json({
        success: true,
        message: `You are currently OFFLINE. Go online to see broadcasts.`,
        bookings: [],
      });
    }

    // Fetch and populate for full detail
    const availableBookings = await Booking.find({ status: "REQUESTED" })
      .populate("service")
      .populate("address")
      .populate("user", "name phone")
      .populate({
        path: "order",
        populate: {
          path: "products.product",
          model: "Product",
        },
      })
      .sort("-createdAt");

    console.log(
      `[BroadcastBookings] Sending ${availableBookings.length} bookings for priest ${priestId}`,
    );

    res.status(200).json({
      success: true,
      count: availableBookings.length,
      bookings: availableBookings,
    });
  } catch (error) {
    console.error("[BroadcastBookings] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const priestId = req.user.id;
    console.log(`[GetMyBookings] Fetching bookings for priest: ${priestId}`);

    // Using explicit ObjectId for robust matching
    const query = { priest: new mongoose.Types.ObjectId(priestId) };
    const bookings = await Booking.find(query)
      .populate("service")
      .populate("address")
      .populate("user", "name phone")
      .populate({
        path: "order",
        populate: {
          path: "products.product",
          model: "Product",
        },
      })
      .sort("-createdAt");

    console.log(
      `[GetMyBookings] Found ${bookings.length} booking(s) for priest ${priestId}`,
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPriestStats = async (req, res) => {
  try {
    const priestId = req.user.id;

    const stats = await Booking.aggregate([
      { $match: { priest: new mongoose.Types.ObjectId(priestId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
        },
      },
    ]);

    // Simplified: Fetch revenue directly from Priest model
    const priest = await Priest.findById(priestId);

    res.status(200).json({
      success: true,
      stats: {
        totalBookings: stats[0]?.totalBookings || 0,
        completedBookings: stats[0]?.completedBookings || 0,
        totalRevenue: priest?.totalRevenue || 0,
      },
    });
  } catch (error) {
    console.error("[PriestStats] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
  DEBUG: Check what keys exist in Redis (dev only)
*/
exports.debugRedisKeys = async (req, res) => {
  try {
    const allKeys = await redis.keys("booking:*");
    const details = {};

    for (let key of allKeys) {
      details[key] = await redis.get(key);
    }

    res.status(200).json({
      success: true,
      keys: allKeys,
      values: details,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
