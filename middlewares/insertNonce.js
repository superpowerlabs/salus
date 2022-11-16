const fs = require("fs-extra");
const path = require("path");

function getIndex(html, index_file) {
  if (!html) {
    html = fs.readFileSync(path.resolve(__dirname, index_file), "utf-8");
  }
  return html;
}

function insertNonce(res, req, html, index_file) {
  html = getIndex(html, index_file);
  if (/Firefox/.test(req.get("user-agent"))) {
    return html;
  } else {
    return html
      .replace(/<script/g, `<script nonce="${res.locals.nonce}"`)
      .replace(/<link/g, `<link nonce="${res.locals.nonce}"`)
      .replace(/<style/g, `<style nonce="${res.locals.nonce}"`);
  }
}

module.exports = (app, config) => {
  let html;
  let index_file = config.siteIndexFile;

  app.use("*", function (req, res, next) {
    if (req.params["0"] === "/") {
      // console.log("... * -> insert nonce", req.originalUrl);
      res.send(insertNonce(res, req, html, index_file));
    } else {
      // console.log("... * -> skip nonce", req.originalUrl);
      next();
    }
  });

  app.use("/:anything", function (req, res, next) {
    if (res.locals.skipCSP) {
      // console.log("... /:anything -> skip nonce", req.originalUrl);
      next();
    } else {
      // console.log("... /:anything -> insert nonce", req.originalUrl);
      res.send(insertNonce(res, req, html, index_file));
    }
  });
};
