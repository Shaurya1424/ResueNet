const mongoose = require("mongoose");

const getHealth = (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    db: mongoose.connection.readyState,
    timestamp: new Date().toISOString()
  });
};

const getReady = (_req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.json({ status: "ready" });
  }

  return res.status(503).json({ status: "not_ready" });
};

module.exports = { getHealth, getReady };
