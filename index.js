const helmet = require("helmet");
const debug = require("debug")("salus");
const { randomBytes } = require("crypto");
const { clone } = require("lodash");
const csp = require("./utils/csp");
const getIPAddress = require("./middlewares/getIPAddress");
const rateLimiter = require("./middlewares/rateLimiter");
const insertNonce = require("./middlewares/insertNonce");

const Salus = {
  spreadConfig(app, config) {
    app.use(function (req, res, next) {
      if (!res.locals.config) {
        res.locals.config = clone(config);
      }
      next();
    });
  },

  applyIPAddress(app, config) {
    Salus.spreadConfig(app, config);
    app.use(getIPAddress);
  },

  applyAll(app, config) {
    Salus.applyRateLimiter(app, config);
    Salus.applyCSP(app, config);
  },

  applyRateLimiter(app, config) {
    Salus.applyIPAddress(app);
    rateLimiter(app, config);
  },

  applyCSP(app, config) {
    Salus.spreadConfig(app, config);

    function checkAnything(anything, res, next) {
      if ((res.locals.config.staticFolders || []).includes(anything)) {
        res.locals.skipCSP = true;
        debug("/:anything route: adding req to skips ->", anything);
      }
      next();
    }

    app.use("/:anything", function (req, res, next) {
      const { anything } = req.params;
      checkAnything(anything, res, next);
    });

    app.use("/:group/:anything", function (req, res, next) {
      let { group, anything } = req.params;
      checkAnything(`${group}/${anything}`, res, next);
    });

    app.use((req, res, next) => {
      debug(
        "non asset detected: triggering security policies",
        req.originalUrl
      );
      if (res.locals.config.disableHelmet || res.locals.skipCSP) {
        next();
      } else {
        res.locals.nonce = randomBytes(16).toString("hex");
        const helmetConfig = csp(res.locals.config, res.locals.nonce);
        helmet(helmetConfig)(req, res, next);
      }
    });

    insertNonce(app, config);
  },
};

module.exports = Salus;
