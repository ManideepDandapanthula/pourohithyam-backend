const express = require("express");
const router = express.Router();
const saamuhikamController = require("../controllers/saamuhikamController");
const protect = require("../middlewares/authMiddleware");

router.get("/all", saamuhikamController.getAllSaamuhikam);
router.get("/my-bookings", protect, saamuhikamController.getUserSaamuhikamBookings);
router.get("/:id", saamuhikamController.getSaamuhikamById);
router.post("/:id/book", protect, saamuhikamController.bookSaamuhikam);

module.exports = router;
