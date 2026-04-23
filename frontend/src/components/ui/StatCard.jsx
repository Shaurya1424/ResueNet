import React from "react";
import PropTypes from "prop-types";
import "./ui.css";

const StatCard = ({ label, value, subtext, icon, tone = "blue", onClick }) => {
  const isClickable = typeof onClick === "function";
  return (
    <div
      className={`ui-statcard tone-${tone}`}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{ cursor: isClickable ? "pointer" : "default" }}
    >
      <div className="ui-statcard-top">
        <span>{label}</span>
        {icon && <span className="ui-statcard-icon">{icon}</span>}
      </div>
      <div className="ui-statcard-value">{value}</div>
      {subtext && <div className="ui-statcard-sub">{subtext}</div>}
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtext: PropTypes.string,
  icon: PropTypes.node,
  tone: PropTypes.oneOf(["blue", "green", "amber", "red", "purple"]),
  onClick: PropTypes.func
};

export default StatCard;
