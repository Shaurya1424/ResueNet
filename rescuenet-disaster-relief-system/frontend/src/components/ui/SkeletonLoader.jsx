import React from "react";
import PropTypes from "prop-types";
import "./ui.css";

const SkeletonLoader = ({ height = 16, width = "100%", rounded = 8, count = 1, style = {}, className = "" }) => {
  if (count > 1) {
    return (
      <div className="ui-skel-grid">
        {Array.from({ length: count }).map((_, index) => (
          <span
            key={index}
            className={`ui-skel ${className}`.trim()}
            style={{ height, width, borderRadius: rounded, ...style }}
          />
        ))}
      </div>
    );
  }

  return (
    <span
      className={`ui-skel ${className}`.trim()}
      style={{ height, width, borderRadius: rounded, ...style }}
    />
  );
};

SkeletonLoader.propTypes = {
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rounded: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  count: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string
};

export default SkeletonLoader;
