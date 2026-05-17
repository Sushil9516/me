const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ===== GET ALL USERS (Search + Filter + Sort + Pagination) =====

router.get("/", async (req, res) => {
  try {
    const { search, minAge, maxAge, sortBy, order, page, limit } = req.query;

    // Build filter object
    let filter = {};

    // Search by name (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Filter by age range
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }

    // Sort option
    let sortOption = {};
    if (sortBy) {
      sortOption[sortBy] = order === "desc" ? -1 : 1;
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 5;
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== ADD USER =====

router.post("/", async (req, res) => {
  try {
    const newUser = new User({ name: req.body.name, age: req.body.age });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== UPDATE USER =====

router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, age: req.body.age },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== DELETE USER =====

router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
