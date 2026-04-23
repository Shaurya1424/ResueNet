const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    disasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Disaster", default: null },
    skills: [{ type: String, trim: true }],
    assignedTask: { type: String, default: "", trim: true },
    taskDescription: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["available", "deployed", "inactive"],
      default: "available"
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
