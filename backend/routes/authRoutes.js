const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Auth = require("../models/Auth");
const authMiddleware = require("../middleware/auth");
const { SECRET } = require("../middleware/auth");

// ===== REGISTER =====

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Auth.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Auth({ name, email, password: hashedPassword });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== LOGIN =====

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Auth.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });

    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== GET PROFILE (Protected) =====

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await Auth.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
