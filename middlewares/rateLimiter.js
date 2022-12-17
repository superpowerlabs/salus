const rateLimiter = require("express-rate-limit");
const debug = require("debug")("salus");

module.exports = (app, config) => {
  if (config.rateLimiter) {
    const { windowMs = 10000, max = 10 } = config.rateLimiter;
    app.use(
      rateLimiter({
        windowMs,
        max,
        keyGenerator: (req) => {
          debug(
            "rate limiting source [%s] with %s request in %s ms",
            req.ip,
            max,
            windowMs
          );
          return req.ip;
        },
      })
    );
  }
};
