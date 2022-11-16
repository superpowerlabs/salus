# Overview

## Installation (temporary instruction until we publish the package)

Assuming your app is in `~/worspace/myapp`.

First, clone the security package repo locally:

```
cd ~/workspace
git clone https://github.com/superpowerlabs/salus
```

Then install the package into your app:

```
cd my app
pnpm i ../salus
```

This will update your `package.json` and install `salus` locally.

## Configuration

This package is designed to work with an express app. You will need to provide the parameter that work for your web app in a `salus.config.js` file.
You'll find a template at the root of the `salus` package `https://github.com/superpowerlabs/salus/saluas.config.js.template`.

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


## Seting the app to use `salus`

Here's an example on how to setup for an Express app:
```js
require("dotenv").config();
const express = require("express");
const path = require("path");
// loading security related modules and configs
const applySecurity = require("salus");
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