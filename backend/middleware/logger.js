const morgan = require("morgan");
const winston = require("winston");
const jwt = require("jsonwebtoken");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const stream = {
  write: (message) => {
    try {
      logger.info(JSON.parse(message));
    } catch (_error) {
      logger.info({ message: message.trim() });
    }
  }
};

const requestLogger = morgan((tokens, req, res) => {
  let userId = req.user?.id || null;

  if (!userId && req.headers.authorization?.startsWith("Bearer ")) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkey");
      userId = decoded.id || null;
    } catch (_error) {
      userId = null;
    }
  }

  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    statusCode: Number(tokens.status(req, res)),
    responseTime: Number(tokens["response-time"](req, res)),
    userId
  });
}, { stream });

module.exports = { requestLogger, logger };
