import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "volunteer") navigate("/volunteer");
      else navigate("/relief-center");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrap">
      <form onSubmit={handleSubmit} className="card auth-card">
        <h2>Welcome Back</h2>
        <p>Sign in to manage disaster relief operations.</p>
        <input className="input" name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input className="input" name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button className="btn btn-primary auth-submit" type="submit">
          Login
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
