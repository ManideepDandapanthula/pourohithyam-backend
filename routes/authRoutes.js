const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

// USER ROUTES
router.post("/user/register", authController.registerUser);
router.post("/user/login", authController.loginUser);

// PRIEST ROUTES
router.post("/priest/register", authController.registerPriest);
router.post("/priest/login", authController.loginPriest);

// ADMIN ROUTE
router.post("/admin/register", authController.registerAdmin);
router.post("/admin/login", authController.loginAdmin);

module.exports = router;
