const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");

router.post("/create", protect, orderController.createOrder);

router.get("/my-orders", protect, orderController.getUserOrders);

router.put("/pay/:id", protect, orderController.markOrderPaid);

module.exports = router;
