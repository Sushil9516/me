const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect("mongodb://127.0.0.1:27017/meanapp")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
