const mongoose = require("mongoose");

const reliefCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 0 },
    resourcesNeeded: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReliefCenter", reliefCenterSchema);
