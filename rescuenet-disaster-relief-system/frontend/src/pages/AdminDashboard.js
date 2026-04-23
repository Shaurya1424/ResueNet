import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { formatDistanceToNow } from "date-fns";
import {
  getAnalyticsOverview,
  getDisasterStats,
  getDisasters,
  getResourceSummary
} from "../api";
import "./adminDashboard.css";

const severityColor = {
  low: "#16a34a",
  medium: "#eab308",
  high: "#f97316",
  critical: "#dc2626"
};

const statusColor = {
  active: "#dc2626",
  reported: "#2563eb",
  assessed: "#7c3aed",
  contained: "#d97706",
  closed: "#6b7280"
};

const safeAddress = (location) =>
  typeof location === "object" && location?.address ? location.address : "Location unavailable";

const safeLatLng = (location) =>
  typeof location === "object" && Number.isFinite(location?.lat) && Number.isFinite(location?.lng)
    ? [location.lat, location.lng]
    : null;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [disasterStats, setDisasterStats] = useState(null);
  const [resourceSummary, setResourceSummary] = useState(null);
  const [disasters, setDisasters] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [overviewRes, disasterStatsRes, resourceSummaryRes, disastersRes] = await Promise.all([
          getAnalyticsOverview(),
          getDisasterStats(),
          getResourceSummary(),
          getDisasters()
        ]);
        setOverview(overviewRes.data);
        setDisasterStats(disasterStatsRes.data);
        setResourceSummary(resourceSummaryRes.data);
        setDisasters(disastersRes.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const severityChartData = useMemo(() => {
    if (!disasterStats?.bySeverity) return [];
    return Object.entries(disasterStats.bySeverity).map(([name, value]) => ({ name, value }));
  }, [disasterStats]);

  const resourceChartData = useMemo(() => {
    if (!resourceSummary?.byType) return [];
    return Object.entries(resourceSummary.byType).map(([type, quantity]) => ({ type, quantity }));
  }, [resourceSummary]);

  const activeDisastersForMap = useMemo(
    () => disasters.filter((item) => item.status === "active" && safeLatLng(item.location)),
    [disasters]
  );

  const filteredDisasters = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = disasters.filter((item) => {
      const address = safeAddress(item.location).toLowerCase();
      return (
        item.title?.toLowerCase().includes(normalizedSearch) ||
        item.type?.toLowerCase().includes(normalizedSearch) ||
        item.severity?.toLowerCase().includes(normalizedSearch) ||
        item.status?.toLowerCase().includes(normalizedSearch) ||
        address.includes(normalizedSearch)
      );
    });

    filtered.sort((a, b) => {
      const getValue = (row) => {
        if (sortKey === "location") return safeAddress(row.location);
        if (sortKey === "affectedPeople") return Number(row.affectedPeople || 0);
        return row[sortKey] || "";
      };
      const valueA = getValue(a);
      const valueB = getValue(b);
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }
      return sortOrder === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
    return filtered;
  }, [disasters, search, sortKey, sortOrder]);

  const setSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortOrder("asc");
  };

  const renderSkeletonRow = () => (
    <div className="ops-grid-4">
      <div className="skel" />
      <div className="skel" />
      <div className="skel" />
      <div className="skel" />
    </div>
  );

  return (
    <div className="ops-dashboard">
      {error && <p className="error-text">{error}</p>}

      {loading ? (
        renderSkeletonRow()
      ) : (
        <div className="ops-grid-4">
          <div className="ops-stat-card">
            <h4>Active Disasters</h4>
            <strong>{overview?.activeDisasters || 0}</strong>
          </div>
          <div className="ops-stat-card blue">
            <h4>Volunteers Deployed</h4>
            <strong>{overview?.deployedVolunteers || 0}</strong>
          </div>
          <div className="ops-stat-card green">
            <h4>Resources Available</h4>
            <strong>{resourceSummary?.totalItems || 0}</strong>
          </div>
          <div className="ops-stat-card amber">
            <h4>Open Resource Requests</h4>
            <strong>{overview?.openRequests || 0}</strong>
          </div>
        </div>
      )}

      <div className="ops-card">
        <h3>Disaster Map</h3>
        <div className="ops-map">
          <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {activeDisastersForMap.map((item) => (
              <CircleMarker
                key={item._id}
                center={safeLatLng(item.location)}
                radius={8}
                pathOptions={{ color: severityColor[item.severity] || "#64748b" }}
              >
                <Popup>
                  <strong>{item.title}</strong>
                  <div>Status: {item.status}</div>
                  <div>Affected People: {item.affectedPeople || 0}</div>
                  <button className="mini-btn">View Details</button>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="ops-section-grid">
        <div className="ops-card">
          <h3>Disasters by Severity</h3>
          <div className="ops-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityChartData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100}>
                  {severityChartData.map((entry) => (
                    <Cell key={entry.name} fill={severityColor[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ops-card">
          <h3>Resource Inventory by Type</h3>
          <div className="ops-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceChartData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" />
                <Tooltip />
                <Bar dataKey="quantity" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ops-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {(overview?.recentActivity || []).map((entry) => (
              <div className="activity-item" key={entry._id}>
                <span className="activity-dot" />
                <div>
                  <strong>{entry.action}</strong>
                  <div>{entry.details || "No details available"}</div>
                  <div className="activity-meta">
                    {entry.performedBy?.name || "System"} ·{" "}
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ops-card">
        <div className="ops-table-header">
          <h3>Active Disasters</h3>
          <input
            className="ops-search"
            placeholder="Search disasters..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <table className="ops-table">
          <thead>
            <tr>
              <th onClick={() => setSort("title")}>Title</th>
              <th onClick={() => setSort("type")}>Type</th>
              <th onClick={() => setSort("location")}>Location</th>
              <th onClick={() => setSort("severity")}>Severity</th>
              <th onClick={() => setSort("status")}>Status</th>
              <th onClick={() => setSort("affectedPeople")}>Affected People</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDisasters.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{item.type}</td>
                <td>{safeAddress(item.location)}</td>
                <td>
                  <span
                    className="badge-pill"
                    style={{
                      backgroundColor: `${severityColor[item.severity] || "#64748b"}20`,
                      color: severityColor[item.severity] || "#64748b"
                    }}
                  >
                    {item.severity}
                  </span>
                </td>
                <td>
                  <span
                    className="badge-pill"
                    style={{
                      backgroundColor: `${statusColor[item.status] || "#64748b"}20`,
                      color: statusColor[item.status] || "#64748b"
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td>{item.affectedPeople || 0}</td>
                <td>
                  <div className="ops-actions">
                    <button className="mini-btn">View</button>
                    <button className="mini-btn">Change Status</button>
                    <button className="mini-btn">Manage Resources</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
