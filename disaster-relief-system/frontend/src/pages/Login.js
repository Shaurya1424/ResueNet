import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { loginUser } from "../api";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginUser(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Logged in successfully");

      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "volunteer") navigate("/volunteer");
      else navigate("/relief-center");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-split">
      <section className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-logo">
            <FaShieldAlt />
            <span>RescueNet</span>
          </div>
          <h1>Coordinating relief when it matters most</h1>
          <p>Emergency-ready platform for disaster teams, volunteers, and relief centers.</p>
        </div>
      </section>
      <section className="auth-right">
        <form onSubmit={handleSubmit} className="card auth-card">
          <h2>Welcome back</h2>
          <p>Sign in to continue.</p>
          <input className="input" name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input className="input" name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button className="btn btn-primary auth-submit" type="submit">
            Login
          </button>
          <p className="auth-linkline">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default Login;
