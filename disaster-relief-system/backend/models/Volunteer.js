const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTask: { type: String, default: "", trim: true },
    disasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Disaster", default: null },
    status: { type: String, default: "available", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
