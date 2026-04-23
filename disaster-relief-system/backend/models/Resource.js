const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["food", "water", "medicine"], required: true },
    quantity: { type: Number, required: true, min: 0 },
    disasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Disaster", required: true },
    unit: { type: String, required: true, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "ReliefCenter", default: null },
    status: {
      type: String,
      enum: ["available", "dispatched", "depleted"],
      default: "available"
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
