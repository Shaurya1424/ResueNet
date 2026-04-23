const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["info", "warning", "critical", "success"],
    default: "info"
  },
  read: { type: Boolean, default: false },
  relatedTo: { type: String, default: "", trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
