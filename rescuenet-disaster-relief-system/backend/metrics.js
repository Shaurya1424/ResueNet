const client = require("prom-client");
const Disaster = require("./models/Disaster");
const Volunteer = require("./models/Volunteer");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const activeDisastersGauge = new client.Gauge({
  name: "active_disasters_gauge",
  help: "Current number of active disasters"
});

const deployedVolunteersGauge = new client.Gauge({
  name: "deployed_volunteers_gauge",
  help: "Current number of deployed volunteers"
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(activeDisastersGauge);
register.registerMetric(deployedVolunteersGauge);

const normalizeRoute = (req) => {
  if (req.route?.path) {
    return req.baseUrl ? `${req.baseUrl}${req.route.path}` : req.route.path;
  }
  return req.path || req.originalUrl.split("?")[0] || "unknown";
};

const requestMetricsMiddleware = (req, res, next) => {
  const endTimer = httpRequestDurationSeconds.startTimer({
    method: req.method,
    route: normalizeRoute(req)
  });

  res.on("finish", () => {
    const route = normalizeRoute(req);
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: String(res.statusCode)
    });
    endTimer({ method: req.method, route });
  });

  next();
};

const updateDynamicGauges = async () => {
  const [activeDisasters, deployedVolunteers] = await Promise.all([
    Disaster.countDocuments({ status: "active" }),
    Volunteer.countDocuments({ status: "deployed" })
  ]);

  activeDisastersGauge.set(activeDisasters);
  deployedVolunteersGauge.set(deployedVolunteers);
};

const getMetricsHandler = async (_req, res) => {
  try {
    await updateDynamicGauges();
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).json({ message: "Failed to collect metrics", error: error.message });
  }
};

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  activeDisastersGauge,
  deployedVolunteersGauge,
  requestMetricsMiddleware,
  getMetricsHandler
};
