const mongoose = require("mongoose");

const disasterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["flood", "earthquake", "cyclone"], required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true, trim: true }
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true
    },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["reported", "assessed", "active", "contained", "closed"],
      default: "reported"
    },
    affectedPeople: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disaster", disasterSchema);
