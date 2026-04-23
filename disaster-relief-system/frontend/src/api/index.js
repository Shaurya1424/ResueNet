import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getHealth = () => api.get("/health");
export const getReady = () => api.get("/ready");

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);

export const getDisasters = () => api.get("/disasters");
export const createDisaster = (data) => api.post("/disasters", data);
export const patchDisasterStatus = (id, status) => api.patch(`/disasters/${id}/status`, { status });
export const getDisasterStats = () => api.get("/disasters/stats");

export const getResources = () => api.get("/resources");
export const createResource = (data) => api.post("/resources", data);
export const dispatchResource = (id, reliefCenterId) =>
  api.patch(`/resources/${id}/dispatch`, { reliefCenterId });
export const getResourceSummary = () => api.get("/resources/summary");

export const getVolunteers = () => api.get("/volunteers");
export const getAvailableVolunteers = () => api.get("/volunteers/available");
export const registerVolunteer = (data) => api.post("/volunteers", data);
export const assignVolunteerTask = (id, data) => api.patch(`/volunteers/${id}`, data);
export const matchVolunteers = (data) => api.post("/volunteers/match", data);
export const getVolunteerMe = () => api.get("/volunteers/me");
export const updateVolunteerMe = (data) => api.patch("/volunteers/me", data);

export const registerReliefCenter = (data) => api.post("/centers", data);
export const getReliefCenters = () => api.get("/centers");
export const getMyReliefCenter = () => api.get("/centers/me");
export const updateMyReliefCenter = (data) => api.patch("/centers/me", data);
export const requestCenterResources = (data) => api.post("/centers/request", data);

export const getAnalyticsOverview = () => api.get("/analytics/overview");
export const getDisasterAnalytics = (id) => api.get(`/analytics/disaster/${id}`);

export const getNotifications = () => api.get("/notifications");
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);

export default api;
