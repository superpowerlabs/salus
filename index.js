const helmet = require("helmet");
const getIPAdress = require("./middlewares/getIPAddress");
const rateLimiter = require("./middlewares/rateLimiter");
const csp = require("./middlewares/csp");
const setNonce = require("./middlewares/setNonce");
const insertNonce = require("./middlewares/insertNonce");

module.exports = (app, config) => {
  app.use(getIPAdress);
  rateLimiter(app, config);

  let skips = config.contentSecurityPolicy.skipCSP || [];

  app.use("/:anything", function (req, res, next) {
    let p = req.params.anything;
    if (skips.includes(p)) {
      res.locals.skipCSP = true;
    }
    next();
  });

  app.use(setNonce);

  app.use((req, res, next) => {
    if (res.locals.skipCSP) {
      // console.log("... skip CSP", req.originalUrl);
      next();
    } else {
      // console.log("... calling CSP", req.originalUrl);
      csp(config)(req, res, next);
    }
  });

  app.use(helmet.crossOriginEmbedderPolicy(config.crossOriginEmbedderPolicy));
  app.use(helmet.crossOriginOpenerPolicy(config.crossOriginOpenerPolicy));
  app.use(helmet.crossOriginResourcePolicy(config.crossOriginResourcePolicy));
  app.use(helmet.dnsPrefetchControl(config.dnsPrefetchControl));
  app.use(helmet.expectCt(config.expectCt));
  app.use(helmet.referrerPolicy(config.referrerPolicy));
  app.use(helmet.hsts(config.hsts));
  app.use(helmet.frameguard(config.frameguard));
  app.use(
    helmet.permittedCrossDomainPolicies(config.permittedCrossDomainPolicies)
  );
  app.use(helmet.referrerPolicy(config.referrerPolicy));

  app.use(helmet.originAgentCluster()); //This middleware takes no options.
  app.use(helmet.ieNoOpen()); //This middleware takes no options.
  app.use(helmet.noSniff()); //This middleware takes no options.
  app.use(helmet.hidePoweredBy()); //This middleware takes no options.
  app.use(helmet.xssFilter()); // This middleware takes no options.

  insertNonce(app, config);
};
