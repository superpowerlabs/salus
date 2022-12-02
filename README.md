# Salus

A set of security middlewares to secure a webapp with rate limiting and CSP headers

## Installation

```
npm i @superpowerlabs/salus
```

## Configuration

This package is designed to work with an express app. You will need to provide the parameter that work for your web app in a `salus.config.js` file.
You'll find a template at the root of the `salus` package `https://github.com/superpowerlabs/salus/salus.config.js.template`.

```js
const config = {
  siteIndexFile: "../../build_latest/index.html",
  contentSecurityPolicy: {
    srcDefaults: ["'self'", "example.com"],
    skipCSP: ["styles", "images", "static"],
    directives: {
      defaultSrc: ["app.openlogin.com", "app.tor.us"],
      connectSrc: ["*.tor.us", "*.ankr.com", "*.walletconnect.org", "wss:"],
      fontSrc: ["fonts.gstatic.com/"],
      imgSrc: ["www.w3.org/"],
      scriptSrc: ["self", "use-nonce"],
      styleSrc: ["mysie.com/", "fonts.googleapis.com/", "app.tor.us/"],
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
  rateLimiter: {
    windowMs: 10000,
    max: 60,
  },
  debug: true,
};

module.exports = { config };

```


## Setting the app to use `salus`

Here's an example on how to setup for an Express app:
```js
require("dotenv").config();
const express = require("express");
const path = require("path");
// loading security related modules and configs
const applySecurity = require("@superpowerlabs/salus");
const config = require("./salus.config");

process.on("uncaughtException", function (error) {
  console.log(error.message);
  console.log(error.stack);
});

const app = express();

// loading security and rate limiting
applySecurity(app, config.config);

app.use("/index.html", function (req, res) {
  res.redirect("/");
});

app.use("/ping", function (req, res) {
  res.send("ok");
});

app.use(express.static(path.resolve(__dirname, "../public")));

module.exports = app;
```

# Development

To run the tests (we recommend you install pnpm):
```sh
git clone https://github.com/superpowerlabs/salus
cd salus
pnpm i
pnpm test
```

# Performance

In this section, we're using the app in the `test` folder to test the performance impact of running salus.

## Setup

Start the app in `test`.
```
cd test
node index.js.hide
```
We're using Apache Bench (`ab` is included with MacOs, you'll have to install it on Windows and Linux).
## Baseline: App without Salus
```
ab -n200 -c100 "http://localhost:3000/"
...cut
Total transferred:      109980 bytes
HTML transferred:       16570 bytes
Requests per second:    2353.13 [#/sec] (mean)
Time per request:       42.496 [ms] (mean)
Time per request:       0.425 [ms] (mean, across all concurrent requests)
Transfer rate:          1263.66 [Kbytes/sec] received
...cut
```
## With Salus skipping assets
```
ab -n200 -c100 "http://localhost:3000/"
...cut
Total transferred:      90986 bytes
HTML transferred:       17387 bytes
Requests per second:    1862.35 [#/sec] (mean)
Time per request:       53.696 [ms] (mean)
Time per request:       0.537 [ms] (mean, across all concurrent requests)
Transfer rate:          827.38 [Kbytes/sec] received
...cut
```

## With Salus not skipping assets

Telling `salus` to skip routes where static assets are served slightly improves performance. 
If we comment out the following line in `salus.config.js` we take all the asset routes through all the security middlewares and create a small performance hits.
```
ab -n200 -c100 "http://localhost:3000/"
...cut
Total transferred:      93580 bytes
HTML transferred:       16570 bytes
Requests per second:    1497.39 [#/sec] (mean)
Time per request:       66.783 [ms] (mean)
Time per request:       0.668 [ms] (mean, across all concurrent requests)
Transfer rate:          684.21 [Kbytes/sec] received
...cut
```

# Read more
If you want to learn more about securing a web app:
- https://content-security-policy.com/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 
# Credits

Author Yacin Bahi <yacin@red64.io>

(c) 2022 Superpower Labs
