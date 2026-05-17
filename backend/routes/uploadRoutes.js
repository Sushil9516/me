const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===== MULTER STORAGE CONFIG =====

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ===== UPLOAD FILE =====

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

// ===== GET ALL FILES =====

router.get("/", (req, res) => {
  const uploadDir = path.join(__dirname, "../uploads");

  if (!fs.existsSync(uploadDir)) return res.json([]);

  const files = fs.readdirSync(uploadDir).map((filename) => ({
    filename,
    path: `/uploads/${filename}`,
  }));

  res.json(files);
});

module.exports = router;
