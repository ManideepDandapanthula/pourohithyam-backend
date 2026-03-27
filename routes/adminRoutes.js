const express = require("express");

const router = express.Router();

const adminController = require("../controllers/adminController");

const protect = require("../middlewares/authMiddleware");

const authorizeRoles = require("../middlewares/roleMiddleware");

const { upload } = require("../config/cloudinary");

router.post(
  "/upload",
  protect,
  authorizeRoles("ADMIN"),
  upload.single("image"),
  adminController.uploadImage
);

/*
PRIEST MANAGEMENT
*/

router.get(
  "/priests/pending",
  protect,
  authorizeRoles("ADMIN"),
  adminController.getPendingPriests,
);

router.put(
  "/priests/approve/:id",
  protect,
  authorizeRoles("ADMIN"),
  adminController.approvePriest,
);

router.delete(
  "/priests/reject/:id",
  protect,
  authorizeRoles("ADMIN"),
  adminController.rejectPriest,
);

/*
PRODUCT MANAGEMENT
*/

router.post(
  "/products",
  protect,
  authorizeRoles("ADMIN"),
  adminController.createProduct,
);

router.put(
  "/products/:id",
  protect,
  authorizeRoles("ADMIN"),
  adminController.updateProduct,
);

router.delete(
  "/products/:id",
  protect,
  authorizeRoles("ADMIN"),
  adminController.deleteProduct,
);

/*
POOJA SERVICES
*/

router.post(
  "/services",
  protect,
  authorizeRoles("ADMIN"),
  adminController.createService,
);

router.put(
  "/services/:id",
  protect,
  authorizeRoles("ADMIN"),
  adminController.updateService,
);

router.delete(
  "/services/:id",
  protect,
  authorizeRoles("ADMIN"),
  adminController.deleteService,
);

/*
ORDERS
*/

router.get(
  "/orders",
  protect,
  authorizeRoles("ADMIN"),
  adminController.getAllOrders,
);

/*
SAAMUHIKAM POOJAS
*/

router.get(
  "/saamuhikam",
  protect,
  authorizeRoles("ADMIN"),
  adminController.getAllSaamuhikam,
);

router.post(
  "/saamuhikam",
  protect,
  authorizeRoles("ADMIN"),
  adminController.createSaamuhikam,
);

router.put(
  "/saamuhikam/:id",
  protect,
  authorizeRoles("ADMIN"),
  adminController.updateSaamuhikam,
);

router.delete(
  "/saamuhikam/:id",
  protect,
  authorizeRoles("ADMIN"),
  adminController.deleteSaamuhikam,
);

module.exports = router;
