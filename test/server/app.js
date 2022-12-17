require("dotenv").config();
const express = require("express");
const path = require("path");
// security related modules and configs
const {applyAll} = require("../../index.js");
const config = require("./salus.config");

process.on("uncaughtException", function (error) {
  console.log(error.message);
  console.log(error.stack);
});

const app = express();

applyAll(app, config.config);

app.use("/index.html", function (req, res) {
  res.redirect("/");
});

app.use("/ping", function (req, res) {
  res.send("ok");
});

app.use(express.static(path.resolve(__dirname, "../public")));

module.exports = app;
