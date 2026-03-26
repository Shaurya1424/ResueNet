import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const VolunteerDashboard = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [status, setStatus] = useState("in_progress");
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  const fetchVolunteers = async () => {
    const { data } = await api.get("/volunteers");
    setVolunteers(data);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const myVolunteerRecord = volunteers.find((v) => v.userId?._id === user?.id);

  const updateTaskStatus = async (e) => {
    e.preventDefault();
    if (!myVolunteerRecord) return;
    await api.put(`/volunteers/${myVolunteerRecord._id}`, { status });
    fetchVolunteers();
  };

  return (
    <div className="content-wrap">
      <h2>Volunteer Dashboard</h2>
      <p>Track assigned work and update your progress.</p>
      {myVolunteerRecord ? (
        <div className="card">
          <p>
            <strong>Assigned Task:</strong> {myVolunteerRecord.assignedTask || "No task assigned"}
          </p>
          <p>
            <strong>Current Status:</strong> {myVolunteerRecord.status}
          </p>
          <form onSubmit={updateTaskStatus} className="inline-form">
            <input className="input" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Update status" />
            <button className="btn btn-primary" type="submit">
              Update Task Status
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <p>No assignment found for your account.</p>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
