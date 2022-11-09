const rateLimiter = require("express-rate-limit");

module.exports = (config) => (req, res, next) => {
  rateLimiter({
    windowMs: config["rate-limiter"]["windowsMs"] || 10000, 
    max: config["rate-limiter"]["max"] || 60, 
    keyGenerator: (req) => {
      const ip =
        req.headers["x-real-ip"] ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress;
      return ip;
    },
  }
)};
