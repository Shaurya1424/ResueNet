import React from "react";
import PropTypes from "prop-types";
import { formatDistanceToNow } from "date-fns";
import "./ui.css";

const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const ActivityFeed = ({ items = [], emptyMessage = "No recent activity.", limit }) => {
  const displayed = typeof limit === "number" ? items.slice(0, limit) : items;

  if (!displayed.length) {
    return <div className="ui-feed-empty">{emptyMessage}</div>;
  }

  return (
    <div className="ui-feed">
      {displayed.map((item) => {
        const date = safeDate(item.timestamp || item.createdAt);
        const actor = item.performedBy?.name || item.actor || "System";
        return (
          <div className="ui-feed-item" key={item._id}>
            <span className="ui-feed-dot" style={{ background: item.color || "#3b82f6" }} />
            <div className="ui-feed-body">
              <strong>{item.action || item.title || "Activity"}</strong>
              <div className="ui-feed-details">{item.details || item.message || "No details available"}</div>
              <div className="ui-feed-meta">
                {actor}
                {date ? ` · ${formatDistanceToNow(date, { addSuffix: true })}` : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

ActivityFeed.propTypes = {
  items: PropTypes.array,
  emptyMessage: PropTypes.string,
  limit: PropTypes.number
};

export default ActivityFeed;
