import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDisasters from "./pages/AdminDisasters";
import AdminResources from "./pages/AdminResources";
import AdminVolunteers from "./pages/AdminVolunteers";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import VolunteerProfile from "./pages/VolunteerProfile";
import ReliefCenterDashboard from "./pages/ReliefCenterDashboard";
import Home from "./pages/Home";
import Layout from "./components/Layout/Layout";

const dashboardRoutePrefixes = ["/admin", "/volunteer", "/relief-center"];

const App = () => {
  const location = useLocation();
  const hidePublicNavbar = dashboardRoutePrefixes.some((prefix) => location.pathname.startsWith(prefix));
  const hideNavbarForAuth = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-shell">
      {!hidePublicNavbar && !hideNavbarForAuth && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disasters"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminDisasters />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminResources />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/volunteers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminVolunteers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <Layout>
                <VolunteerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/profile"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <Layout>
                <VolunteerProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/relief-center"
          element={
            <ProtectedRoute allowedRoles={["relief_center"]}>
              <Layout>
                <ReliefCenterDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
