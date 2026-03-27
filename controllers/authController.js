const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Priest = require("../models/Priest");
const Admin = require("../models/Admin");

const generateToken = require("../utils/generatetokens");

//ADmin REgister && Login Controllers

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
    });

    const token = generateToken(admin);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
ADMIN LOGIN
*/
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      token,
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// USER REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// USER LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// PRIEST REGISTER
exports.registerPriest = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      experience,
      languages,
      specialization,
    } = req.body;

    const existingPriest = await Priest.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingPriest) {
      return res.status(400).json({
        message: "Priest already exists",
      });
    }

    await Priest.create({
      name,
      email,
      password: hashedPassword,
      phone,
      experience,
      languages,
      specialization,
    });

    res.status(201).json({
      message: "Priest registered. Waiting for admin approval",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// PRIEST LOGIN
exports.loginPriest = async (req, res) => {
  try {
    const { email, password } = req.body;

    const priest = await Priest.findOne({ email });

    if (!priest) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!priest.isApproved) {
      return res.status(403).json({
        message: "Priest not approved by admin",
      });
    }

    const match = await bcrypt.compare(password, priest.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(priest);

    res.json({
      message: "Priest login successful",
      token,
      priest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ADMIN LOGIN
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(admin);

    res.json({
      message: "Admin login successful",
      token,
      admin,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
