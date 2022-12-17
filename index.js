const helmet = require("helmet");
const debug = require('debug')('salus');
const {randomBytes} = require("crypto");
const csp = require("./utils/csp");
const getIPAddress = require("./middlewares/getIPAddress");
const rateLimiter = require("./middlewares/rateLimiter");
const insertNonce = require("./middlewares/insertNonce");

const Salus = {

  applyIPAddress(app) {
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

    app.use("/:anything", function (req, res, next) {
      let p = req.params.anything;
      if ((config.staticFolders || []).includes(p)) {
        res.locals.skipCSP = true;
        debug("/:anything route: adding req to skips ->", p);
      }
      next();
    });

    app.use((req, res, next) => {
      debug("non asset detected: triggering security policies", req.originalUrl);
      if (config.disableHelmet || res.locals.skipCSP) {
        next();
      } else {
        res.locals.nonce = randomBytes(16).toString("hex");
        const {helmetConfig} = csp(config, res.locals.nonce);
        helmet(helmetConfig)(req, res, next);
      }
    });

    insertNonce(app, config);
  }
}

module.exports = Salus;
