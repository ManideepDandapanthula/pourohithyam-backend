const Order = require("../models/Order");
const Product = require("../models/Product");
const PoojaService = require("../models/PoojaService");

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

    res.status(201).json({
      success: true,
      message: "Order created",
      data: order,
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
MARK ORDER PAID
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
