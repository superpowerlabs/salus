const helmet = require("helmet");
const debug = require('debug')('salus');
const getIPAdress = require("./middlewares/getIPAddress");
const rateLimiter = require("./middlewares/rateLimiter");
const csp = require("./middlewares/csp");
const setNonce = require("./middlewares/setNonce");
const insertNonce = require("./middlewares/insertNonce");

function skipAssets(config) {
  let skips = [];
  if (typeof config.contentSecurityPolicy !== 'undefined') {
    skips = config.contentSecurityPolicy.skipCSP || [];
  }
  return skips;
}

module.exports = (app, config) => {
  app.use(getIPAdress);
  rateLimiter(app, config);

  let skips = skipAssets(config);

  app.use("/:anything", function (req, res, next) {
    let p = req.params.anything;
    if (skips.includes(p)) {
      res.locals.skipCSP = true;
      debug("/:anything skipping CSP for ->", p);
    }
    debug("/:anything keeping CSP for ->", p);
    next();
  });

  app.use(setNonce);
  app.use(csp(config));

  app.use((req, res, next) => {
    if (res.locals.skipCSP) {
      debug("asset detected: skipping security policies", req.originalUrl);
      next();
    } else {
      debug("non asset detected: triggering security policies", req.originalUrl);
      helmet(config)(req, res, next);
    }
  });
  insertNonce(app, config);
};
