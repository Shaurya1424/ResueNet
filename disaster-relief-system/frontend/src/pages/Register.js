import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer"
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/auth/register", form);
      setMessage("Registration successful. Please login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-wrap">
      <form onSubmit={handleSubmit} className="card auth-card">
        <h2>Create Account</h2>
        <p>Register as admin, volunteer, or relief center.</p>
        <input className="input" name="name" placeholder="Name" onChange={handleChange} required />
        <input className="input" name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input className="input" name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <select className="input" name="role" value={form.role} onChange={handleChange}>
          <option value="admin">Admin</option>
          <option value="volunteer">Volunteer</option>
          <option value="relief_center">Relief Center</option>
        </select>
        <button className="btn btn-primary auth-submit" type="submit">
          Register
        </button>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
};

export default Register;
