const mongoose = require("mongoose");

const reliefCenterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true, trim: true }
    },
    capacity: { type: Number, required: true, min: 0 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    resourcesNeeded: [
      {
        resourceType: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        urgency: { type: String, required: true, trim: true }
      }
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "overwhelmed"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReliefCenter", reliefCenterSchema);
