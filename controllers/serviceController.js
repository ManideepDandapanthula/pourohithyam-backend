const PoojaService = require("../models/PoojaService");

/*
GET ALL SERVICES (PUBLIC)
*/
exports.getAllServices = async (req, res) => {
  try {
    const services = await PoojaService.find();

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
