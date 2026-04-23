import React from "react";
import PropTypes from "prop-types";
import { FaExclamationTriangle } from "react-icons/fa";
import "./ui.css";

const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onClose
}) => {
  if (!open) return null;

  return (
    <div className="ui-modal-wrap">
      <div className="ui-modal-backdrop" onClick={loading ? undefined : onClose} />
      <div className="ui-modal" role="dialog" aria-modal="true">
        <div className="ui-modal-head">
          <span className="ui-modal-icon">
            <FaExclamationTriangle />
          </span>
          <div>
            <h3>{title}</h3>
            {typeof message === "string" ? <p style={{ margin: "6px 0 0", color: "#475569" }}>{message}</p> : message}
          </div>
        </div>
        <div className="ui-modal-actions">
          <button type="button" className="ui-btn" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className={`ui-btn ${tone}`} onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.node,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  tone: PropTypes.oneOf(["primary", "danger"]),
  loading: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ConfirmModal;
