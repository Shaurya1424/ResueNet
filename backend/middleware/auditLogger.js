const AuditLog = require("../models/AuditLog");

const auditLogger = async ({ action, performedBy, targetEntity, targetId, details = "" }) => {
  if (!action || !performedBy || !targetEntity || !targetId) {
    return null;
  }

  return AuditLog.create({
    action,
    performedBy,
    targetEntity,
    targetId,
    details
  });
};

module.exports = auditLogger;
