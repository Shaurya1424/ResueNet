const mongoose = require("mongoose");

const disasterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["flood", "earthquake", "cyclone"], required: true },
    location: { type: String, required: true, trim: true },
    severity: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Disaster", disasterSchema);
