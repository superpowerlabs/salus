const rateLimiter = require("express-rate-limit");
const debug = require('debug')('salus');

module.exports = (app, config) => {
  if (config["rateLimiter"]) {
    const windowMs = config["rateLimiter"]["windowsMs"] || 10000;
    const max = config["rateLimiter"]["max"] || 60
    app.use(
      rateLimiter({
        windowMs: windowMs,
        max: max,
        keyGenerator: (req) => {
          const ip =
            req.headers["x-real-ip"] ||
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress;
          debug("rate limiting source [%s] with %s request in %s ms", ip, max, windowMs);
          return ip;
        },
      })
    );
  }
};
