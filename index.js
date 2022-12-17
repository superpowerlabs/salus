const helmet = require("helmet");
const debug = require('debug')('salus');
const crypto = require("crypto");
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

module.exports = (app, config) => {
  app.use(getIPAddress);
  rateLimiter(app, config);

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
    let full_config;
      debug("non asset detected: triggering security policies", req.originalUrl);
      if (config.disableHelmet) {
        next();
      } else {
        res.locals.nonce = crypto.randomBytes(16).toString("hex");
        full_config = csp(config, res.locals.nonce);
        helmet(full_config)(req, res, next);
      }
  });

  insertNonce(app, config);
};
