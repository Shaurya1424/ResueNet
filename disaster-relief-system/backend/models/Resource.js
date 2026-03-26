const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["food", "water", "medicine"], required: true },
    quantity: { type: Number, required: true, min: 0 },
    disasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Disaster", required: true },
    status: { type: String, default: "available", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
