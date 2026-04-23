import React from "react";
import PropTypes from "prop-types";
import "./ui.css";

const severityToneMap = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical"
};

const statusToneMap = {
  // disasters
  reported: "info",
  assessed: "info",
  active: "danger",
  contained: "warning",
  closed: "neutral",
  // resources
  available: "success",
  dispatched: "info",
  depleted: "danger",
  // volunteers
  deployed: "info",
  inactive: "neutral",
  // relief centers
  overwhelmed: "danger",
  // notifications
  warning: "warning",
  success: "success",
  info: "info"
};

const resolveTone = (tone, kind, label) => {
  if (tone) return tone;
  const value = String(label || "").toLowerCase();
  if (kind === "severity") return severityToneMap[value] || "neutral";
  return statusToneMap[value] || "neutral";
};

const StatusBadge = ({ label, tone, kind = "status", withDot = false, className = "" }) => {
  if (!label) return null;
  const resolvedTone = resolveTone(tone, kind, label);
  return (
    <span className={`ui-badge tone-${resolvedTone} ${className}`.trim()}>
      {withDot && <span className="ui-badge-dot" />}
      {label}
    </span>
  );
};

StatusBadge.propTypes = {
  label: PropTypes.string,
  tone: PropTypes.string,
  kind: PropTypes.oneOf(["status", "severity"]),
  withDot: PropTypes.bool,
  className: PropTypes.string
};

export default StatusBadge;
