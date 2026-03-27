const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const addressController = require("../controllers/addressController");

router.post("/add", protect, addressController.addAddress);

router.get("/my-addresses", protect, addressController.getUserAddresses);
router.get("/latest", protect, addressController.getLatestAddress);

module.exports = router;
