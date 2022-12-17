const helmet = require("helmet");
const debug = require('debug')('salus');
const {randomBytes} = require("crypto");
const csp = require("./utils/csp");
const getIPAddress = require("./middlewares/getIPAddress");
const rateLimiter = require("./middlewares/rateLimiter");
const insertNonce = require("./middlewares/insertNonce");

function skipAssets(config) {
  let skips = [];
  if (typeof config.contentSecurityPolicy === 'object'
      && config.contentSecurityPolicy.hasOwnProperty('skipCSP')) {
    skips = config.contentSecurityPolicy.skipCSP;
  }
  return skips;
}

const Salus = {

  applyAll(app, config) {
    Salus.applyRateLimiter(app, config);
    Salus.applyCSP(app, config);
  },

  applyRateLimiter(app, config) {
    if (!config.noRateLimiter) {
      app.use(getIPAddress);
      rateLimiter(app, config);
    }
  },

  applyCSP(app, config) {

    let skips = skipAssets(config);

    app.use("/:anything", function (req, res, next) {
      let p = req.params.anything;
      if (skips.includes(p)) {
        res.locals.skipCSP = true;
        debug("/:anything route: adding req to skips ->", p);
      }
      next();
    });

    app.use((req, res, next) => {
      debug("non asset detected: triggering security policies", req.originalUrl);
      if (config.disableHelmet) {
        next();
      } else {
        res.locals.nonce = randomBytes(16).toString("hex");
        const helmetConfig = csp(config, res.locals.nonce);
        console.log(999);
        console.log(helmetConfig)
        helmet(helmetConfig)(req, res, next);
      }
    });

    insertNonce(app, config);
  }
}

module.exports = Salus;
