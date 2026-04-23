const express = require("express");
const cors = require("cors");
const { requestLogger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const { requestMetricsMiddleware, getMetricsHandler } = require("./metrics");

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}
app.use(requestMetricsMiddleware);

app.use("/api", require("./routes/healthRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/disasters", require("./routes/disasterRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/volunteers", require("./routes/volunteerRoutes"));
app.use("/api/centers", require("./routes/reliefCenterRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get("/", (_req, res) => {
  res.send("RescueNet API is running");
});
app.get("/api/metrics", getMetricsHandler);

app.use(errorHandler);

module.exports = app;
