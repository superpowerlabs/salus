const request = require("supertest");
const expect = require("chai").expect;
const express = require('express');
const applySalus = require("../index.js");

describe("Rate limiting", function () {
  const app = express();
  const config = {
    disableHelmet: true,
    rateLimiter: {
      windowMs: 10000, // 10 seconds
      max: 10, // Limit each IP to 10 requests per `window` (here, per 10 seconds)
    },
  };
  applySalus(app, config);
  app.use("/ping", function (req, res) {
    res.send("ok");
  });

  it("should insert rate limiting factors headers", function (done) {
    request(app).get("/ping").expect("X-RateLimit-Limit", "10").expect(200, done);
  });

  it("should not insert helmet headers", async function () {
    let response;
    response = await request(app).get("/ping");
    let headers = response.headers;
    expect(headers['content-security-policy']).eq(undefined);
    expect(headers['cross-origin-embedder-policy']).eq(undefined);
    expect(headers['x-dns-prefetch-control']).eq(undefined);
    expect(headers['x-frame-options']).eq(undefined);
  });
});