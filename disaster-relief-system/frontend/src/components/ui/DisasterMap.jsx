import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./ui.css";

const DEFAULT_CENTER = [20.5937, 78.9629];

const SEVERITY_COLORS = {
  low: "#16a34a",
  medium: "#eab308",
  high: "#f97316",
  critical: "#dc2626"
};

const hasValidCoords = (location) =>
  location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng));

const DisasterMap = ({
  markers = [],
  center,
  zoom = 4,
  height = 320,
  useMarker = false,
  children,
  tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
}) => {
  const resolvedCenter = useMemo(() => {
    if (center && Number.isFinite(center[0]) && Number.isFinite(center[1])) return center;
    const first = markers.find((item) => hasValidCoords(item.location));
    return first ? [first.location.lat, first.location.lng] : DEFAULT_CENTER;
  }, [center, markers]);

  const validMarkers = useMemo(() => markers.filter((item) => hasValidCoords(item.location)), [markers]);

  return (
    <div className="ui-map" style={{ height }}>
      <MapContainer center={resolvedCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer url={tileUrl} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        {validMarkers.map((item) => {
          const position = [item.location.lat, item.location.lng];
          const color = SEVERITY_COLORS[item.severity] || "#3b82f6";
          const popup = (
            <Popup>
              {item.title && <strong>{item.title}</strong>}
              {item.description && <div>{item.description}</div>}
              {item.severity && <div>Severity: {item.severity}</div>}
              {item.status && <div>Status: {item.status}</div>}
            </Popup>
          );
          return useMarker ? (
            <Marker key={item._id || `${position[0]}-${position[1]}`} position={position}>
              {popup}
            </Marker>
          ) : (
            <CircleMarker
              key={item._id || `${position[0]}-${position[1]}`}
              center={position}
              radius={8}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
            >
              {popup}
            </CircleMarker>
          );
        })}
        {children}
      </MapContainer>
    </div>
  );
};

DisasterMap.propTypes = {
  markers: PropTypes.array,
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  useMarker: PropTypes.bool,
  children: PropTypes.node,
  tileUrl: PropTypes.string
};

export default DisasterMap;
