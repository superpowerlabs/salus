const config = {
  siteIndexFile: "../test/public/index.html",
  staticFolders: ["styles", "images", "static"],
  srcDefaults: ["'self'", "example1.com"],
  helmetConfig: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["example2.com"],
        connectSrc: ["example3.com"],
        fontSrc: ["fonts.gstatic.com"],
        imgSrc: ["www.w3.org"],
        scriptSrc: ["self", "use-nonce"],
        styleSrc: ["example4.com"],
        frameSrc: ["example5.com"],
      },
    },
    crossOriginEmbedderPolicy: {
      policy: "credentialless",
    },
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
    // options.allow is a boolean dictating whether to enable DNS prefetching. It defaults to false
    dnsPrefetchControl: {
      allow: true,
    },
    referrerPolicy: {
      policy: ["origin", "unsafe-url"],
    },
    expectCt: {
      maxAge: 86400,
      enforce: true,
      reportUri: "example.com",
    },
    hsts: {
      maxAge: 123456,
      includeSubDomains: false,
      preload: true,
    },
    //options.action is a string that specifies which directive to use—either DENY or SAMEORIGIN.
    frameguard: {
      action: "deny",
    },
    // options.permittedPolicies is a string that must be "none", "master-only", "by-content-type", or "all". It defaults to "none".
    permittedCrossDomainPolicies: {
      permittedPolicies: "master-only",
    },
  },
  rateLimiter: {
    windowMs: 10000, // 10 seconds
    max: 11, // Limit each IP to 10 requests per `window` (here, per 10 seconds)
  },
  debug: true,
};

module.exports = { config };
