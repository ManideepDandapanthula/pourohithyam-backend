const Priest = require("../models/Priest");
const Product = require("../models/Product");
const PoojaService = require("../models/PoojaService");
const Order = require("../models/Order");
const SaamuhikamPooja = require("../models/SaamuhikamPooja");

/*
UPLOAD IMAGE
*/
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    
    res.status(200).json({
      success: true,
      url: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
GET PENDING PRIESTS
*/
exports.getPendingPriests = async (req, res) => {
  try {
    const priests = await Priest.find({ isApproved: false }).select(
      "-password",
    );

    res.status(200).json({
      success: true,
      count: priests.length,
      data: priests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
APPROVE PRIEST
*/
exports.approvePriest = async (req, res) => {
  try {
    const { id } = req.params;

    const priest = await Priest.findById(id);

    if (!priest) {
      return res.status(404).json({
        success: false,
        message: "Priest not found",
      });
    }

    priest.isApproved = true;
    await priest.save();

    res.status(200).json({
      success: true,
      message: "Priest approved",
      data: priest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
REJECT PRIEST
*/
exports.rejectPriest = async (req, res) => {
  try {
    const { id } = req.params;

    const priest = await Priest.findById(id);

    if (!priest) {
      return res.status(404).json({
        success: false,
        message: "Priest not found",
      });
    }

    await priest.deleteOne();

    res.status(200).json({
      success: true,
      message: "Priest rejected and removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
CREATE PRODUCT
*/
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      image,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
UPDATE PRODUCT
*/
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
DELETE PRODUCT
*/
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
CREATE POOJA SERVICE
*/
exports.createService = async (req, res) => {
  try {
    const { name, description, category, price, materials, image } = req.body;

    const service = await PoojaService.create({
      name,
      description,
      category,
      price,
      materials,
      image,
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
UPDATE POOJA SERVICE
*/
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await PoojaService.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
DELETE SERVICE
*/
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await PoojaService.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Service deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
GET ALL ORDERS
*/
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("service", "name price");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
GET ALL SAAMUHIKAM POOJAS (ADMIN)
*/
exports.getAllSaamuhikam = async (req, res) => {
  try {
    const poojas = await SaamuhikamPooja.find().sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: poojas.length,
      data: poojas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
CREATE SAAMUHIKAM POOJA
*/
exports.createSaamuhikam = async (req, res) => {
  try {
    const {
      name, description, procedure, benefits,
      beneficiaries, price, date, time,
      image, maxParticipants, isActive,
    } = req.body;

    if (!name || !description || !price || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, date, and time are required",
      });
    }

    const pooja = await SaamuhikamPooja.create({
      name, description, procedure, benefits,
      beneficiaries, price, date, time,
      image, maxParticipants, isActive,
    });

    res.status(201).json({
      success: true,
      data: pooja,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
UPDATE SAAMUHIKAM POOJA
*/
exports.updateSaamuhikam = async (req, res) => {
  try {
    const { id } = req.params;

    const pooja = await SaamuhikamPooja.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!pooja) {
      return res.status(404).json({
        success: false,
        message: "Saamuhikam Pooja not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pooja,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
DELETE SAAMUHIKAM POOJA
*/
exports.deleteSaamuhikam = async (req, res) => {
  try {
    const { id } = req.params;

    const pooja = await SaamuhikamPooja.findById(id);

    if (!pooja) {
      return res.status(404).json({
        success: false,
        message: "Saamuhikam Pooja not found",
      });
    }

    await pooja.deleteOne();

    res.status(200).json({
      success: true,
      message: "Saamuhikam Pooja deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
