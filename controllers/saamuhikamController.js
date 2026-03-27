const SaamuhikamPooja = require("../models/SaamuhikamPooja");
const SaamuhikamOrder = require("../models/SaamuhikamOrder");

/*
GET ALL SAAMUHIKAM POOJAS (PUBLIC)
*/
exports.getAllSaamuhikam = async (req, res) => {
  try {
    const poojas = await SaamuhikamPooja.find({ isActive: true }).sort({
      date: 1,
    });

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
GET SINGLE SAAMUHIKAM POOJA BY ID (PUBLIC)
*/
exports.getSaamuhikamById = async (req, res) => {
  try {
    const pooja = await SaamuhikamPooja.findById(req.params.id);

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
BOOK A SAAMUHIKAM POOJA (PROTECTED)
*/
exports.bookSaamuhikam = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentId } = req.body;

    const pooja = await SaamuhikamPooja.findById(id);
    if (!pooja) {
      return res.status(404).json({ success: false, message: "Pooja not found" });
    }

    if (pooja.maxParticipants > 0 && pooja.bookedSlots >= pooja.maxParticipants) {
      return res.status(400).json({ success: false, message: "No slots left for this pooja" });
    }

    const existingOrder = await SaamuhikamOrder.findOne({
      user: req.user.id,
      saamuhikamPooja: id
    });

    if (existingOrder) {
      return res.status(400).json({ success: false, message: "You are already registered for this Pooja." });
    }

    const order = await SaamuhikamOrder.create({
      user: req.user.id,
      saamuhikamPooja: id,
      amountPaid,
      paymentId: paymentId || "mock_payment_id",
    });

    pooja.bookedSlots += 1;
    await pooja.save();

    res.status(201).json({
      success: true,
      message: "Successfully booked Saamuhikam Pooja!",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
GET A USER'S SAAMUHIKAM BOOKINGS (PROTECTED)
*/
exports.getUserSaamuhikamBookings = async (req, res) => {
  try {
    const orders = await SaamuhikamOrder.find({ user: req.user.id })
      .populate("saamuhikamPooja")
      .sort({ createdAt: -1 });

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
