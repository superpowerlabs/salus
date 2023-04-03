const path = require("path");
const helmet = require("helmet");
const debug = require("debug")("salus");
const { randomBytes } = require("crypto");
const { clone } = require("lodash");
const csp = require("./utils/csp");
const getIPAddress = require("./middlewares/getIPAddress");
const rateLimiter = require("./middlewares/rateLimiter");
const insertNonce = require("./middlewares/insertNonce");

const Salus = {
  spreadConfig(app, config = {}) {
    app.use(function (req, res, next) {
      if (!res.locals.config || Object.keys(res.locals.config).length === 0) {
        res.locals.config = JSON.parse(JSON.stringify(config));
      }
      next();
    });
  },

  applyIPAddress(app, config) {
    Salus.spreadConfig(app, config);
    app.use(getIPAddress);
  },

  applyAll(app, config) {
    console.log(3333, config);
    Salus.applyRateLimiter(app, config);
    Salus.applyCSP(app, config);
  },

  applyRateLimiter(app, config) {
    Salus.applyIPAddress(app);
    rateLimiter(app, config);
  },

  applyCSP(app, config) {
    Salus.spreadConfig(app, config);

    app.use("*", (req, res, next) => {
      debug(
        "non asset detected: triggering security policies",
        req.originalUrl
      );
      if (res.locals.config.disableHelmet) {
        next();
      } else {
        // we apply it only to index.html because all other routes are
        // served by React
        if (req.params[0] === (res.locals.config.indexRoute || "/")) {
          res.locals.nonce = randomBytes(16).toString("hex");
          const helmetConfig = csp(res.locals.config, res.locals.nonce);
          helmet(helmetConfig)(req, res, next);
        } else {
          next();
        }
      }
    });

    insertNonce(app, config);
  },
};

module.exports = Salus;
