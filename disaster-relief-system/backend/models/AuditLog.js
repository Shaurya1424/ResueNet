const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, trim: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetEntity: { type: String, required: true, trim: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: String, default: "", trim: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
