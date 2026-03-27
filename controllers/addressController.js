const Address = require("../models/Address.js");
const redis = require("../config/redis");
const { latestAddressKey } = require("../utils/redisKeys");

/*
ADD ADDRESS
*/

exports.addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      house,
      street,
      city,
      state,
      pincode,
      tag,
      isDefault,
    } = req.body;

    const address = await Address.create({
      user: req.user.id,
      fullName,
      phone,
      house,
      street,
      city,
      state,
      pincode,
      tag,
      isDefault,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
GET USER ADDRESSES
*/

exports.getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
GET LATEST USED ADDRESS
*/

exports.getLatestAddress = async (req, res) => {
  try {
    const addressId = await redis.get(latestAddressKey(req.user.id));

    if (!addressId) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const address = await Address.findById(addressId);

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
