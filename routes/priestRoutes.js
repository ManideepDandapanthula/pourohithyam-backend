const express = require("express");
const router = express.Router();

const priestController = require("../controllers/priestController");
const protect = require("../middlewares/authMiddleware");

router.put("/availability", protect, priestController.updateAvailability);

router.get(
  "/broadcast-bookings",
  protect,
  priestController.getBroadcastBookings,
);

router.get("/my-bookings", protect, priestController.getMyBookings);
router.get("/stats", protect, priestController.getPriestStats);

// DEV-ONLY: Inspect Redis state
router.get("/debug-redis", protect, priestController.debugRedisKeys);

module.exports = router;
