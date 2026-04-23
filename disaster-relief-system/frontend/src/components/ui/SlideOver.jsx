import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa";
import "./ui.css";

const SlideOver = ({ open, title, onClose, children }) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`ui-slideover-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`ui-slideover ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open}>
        <div className="ui-slideover-head">
          <h3>{title}</h3>
          <button type="button" className="ui-slideover-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="ui-slideover-body">{children}</div>
      </aside>
    </>
  );
};

SlideOver.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node
};

export default SlideOver;
