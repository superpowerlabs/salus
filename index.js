const helmet = require("helmet");
const ipAddressMiddleware = require("./middlewares/getIPAddress");
const limiterMiddleware = require("./middlewares/rateLimiter");
const cspMiddleware = require("./middlewares/csp");
const nonceMIddleware = require("./middlewares/setNonce");
const insertNonceMiddleware = require("./middlewares/insertNonce");



module.exports = (app, config) => {
  app.use(ipAddressMiddleware);
  app.use(limiterMiddleware);

  console.log(config.contentSecurityPolicy);
  let skips = config.contentSecurityPolicy.skipCSP || [];

  app.use("/:anything", function (req, res, next) {
    let p = req.params.anything;
    if (skips.includes(p)) {
      res.locals.skipCSP = true;
    }
    next();
  });

  app.use(nonceMIddleware);

  app.use((req, res, next) => {
    if (res.locals.skipCSP) {
      next();
    } else {
      cspMiddleware(config)(req, res, next);
    }
  });

  app.use(
    helmet.crossOriginEmbedderPolicy(config.crossOriginEmbedderPolicy)
  );

  app.use(
    helmet.crossOriginOpenerPolicy(config.crossOriginOpenerPolicy)
  );
  app.use(helmet.crossOriginResourcePolicy());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.expectCt());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.originAgentCluster());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());

  insertNonceMiddleware(app, config);
};
