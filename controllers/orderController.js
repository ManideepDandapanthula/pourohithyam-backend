const Order = require("../models/Order");
const Product = require("../models/Product");
const PoojaService = require("../models/PoojaService");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const crypto = require("crypto");

/*
CREATE ORDER
*/

exports.createOrder = async (req, res) => {
  try {
    const { service, products = [] } = req.body;

    const poojaService = await PoojaService.findById(service);

    if (!poojaService) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    let totalAmount = req.body.totalAmount || poojaService.price;

    let populatedProducts = [];

    for (let item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const price = product.price * item.quantity;

      totalAmount += price;

      populatedProducts.push({
        product: product._id,
        quantity: item.quantity,
      });
    }

    const order = await Order.create({
      user: req.user.id,
      service,
      products: populatedProducts,
      totalAmount,
      status: "CREATED",
    });

    let razorpayOrder = null;
    if (razorpay) {
      razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // amount in paise
        currency: "INR",
        receipt: order._id.toString(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Order created",
      data: order,
      razorpayOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
GET USER ORDERS
*/

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("service")
      .populate("products.product");

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
MARK ORDER PAID (MOCK)
*/

exports.markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "PAID" },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Order marked as paid",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
VERIFY RAZORPAY PAYMENT
*/

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status: "PAID" },
        { new: true }
      );

      // Create Payment Record
      const payment = await Payment.create({
        order: order._id,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: order.totalAmount,
        status: "SUCCESS",
        method: "RAZORPAY"
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: order,
        payment,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature sent!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
