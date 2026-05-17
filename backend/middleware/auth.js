// ===== JWT AUTH MIDDLEWARE =====

const jwt = require("jsonwebtoken");

const SECRET = "meanapp_secret_key";

function auth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = auth;
module.exports.SECRET = SECRET;
