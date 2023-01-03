const fs = require("fs-extra");
const path = require("path");
const debug = require("debug")("salus");

function getIndex(html, index_file) {
  if (!html) {
    html = fs.readFileSync(path.resolve(__dirname, index_file), "utf-8");
  }
  return html;
}

function insertNonce(res, req, html, index_file) {
  html = getIndex(html, index_file);
  // note: removing the test if (res.locals.nonce) since this function can't be
  //       reached if res.locals.nonce is not set
  return html
    .replace(/<script/g, `<script nonce="${res.locals.nonce}"`)
    .replace(/<link/g, `<link nonce="${res.locals.nonce}"`)
    .replace(/<style/g, `<style nonce="${res.locals.nonce}"`)
    .replace(
      /<meta property="csp-nonce"/g,
      `<meta property="csp-nonce" content="${res.locals.nonce}"`
    );
}

module.exports = (app, config) => {
  let html;
  let index_file = config.siteIndexFile;

  if (index_file === "undefined" || typeof index_file !== "string") {
    console.log(
      "Salus: skipping nonce bc index file in salus.config.js not set"
    );
    return;
  }

  app.use("*", function (req, res, next) {
    debug("inserNonce Middleware testing /*");
    if (req.params["0"] === "/") {
      debug("... * -> insert nonce", req.originalUrl);
      res.send(insertNonce(res, req, html, index_file));
    } else {
      debug("... * -> skip nonce", req.originalUrl);
      next();
    }
  });

  app.use("/:anything", function (req, res, next) {
    debug("inserNonce Middleware testing /:anything");
    if (res.locals.skipCSP) {
      debug("... /:anything -> skip nonce", req.originalUrl);
      next();
    } else {
      debug("... /:anything -> insert nonce", req.originalUrl);
      res.send(insertNonce(res, req, html, index_file));
    }
  });
};
