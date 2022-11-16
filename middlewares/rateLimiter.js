const rateLimiter = require("express-rate-limit");

module.exports = (app, config) => {
  if (config["rateLimiter"]) {
    app.use(
      rateLimiter({
        windowMs: config["rateLimiter"]["windowsMs"] || 10000,
        max: config["rateLimiter"]["max"] || 60,
        keyGenerator: (req) => {
          const ip =
            req.headers["x-real-ip"] ||
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress;
          return ip;
        },
      })
    );
  }
};
