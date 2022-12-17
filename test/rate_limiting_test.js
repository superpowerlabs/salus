const request = require("supertest");
const expect = require("chai").expect;
const express = require('express');
const {applyAll, applyRateLimiter} = require("../index.js");

describe("Rate limiting", function () {

  describe("applyAll", function () {
    const ping_app = express();
    const config = {
      rateLimiter: {
        // defaults
        // windowMs: 10000, // 10 seconds
        // max: 10, // Limit each IP to 10 requests per `window` (here, per 10 seconds)
      },
    };

    applyAll(ping_app, config);
    ping_app.use("/ping", function (req, res) {
      res.send("ok");
    });

    it("should returns 429 if rate limit reached", async function () {
      let response;
      for (let i = 0; i < 11; i++) {
        response = await request(ping_app).get("/ping");
        expect(response.status).eq(i < 10 ? 200 : 429);
      }
    });
  });

  describe("applyRateLimiter", function () {
    const ping_app = express();
    const config = {
      rateLimiter: {
        windowMs: 10000, // 10 seconds
        max: 10, // Limit each IP to 10 requests per `window` (here, per 10 seconds)
      },
    };

    applyRateLimiter(ping_app, config);
    ping_app.use("/ping", function (req, res) {
      res.send("ok");
    });

    it("should returns 429 if rate limit reached", async function () {
      let response;
      for (let i = 0; i < 10; i++) {
        response = await request(ping_app).get("/ping");
        expect(response.status).eq(200);
      }
      response = await request(ping_app).get("/ping");
      expect(response.status).eq(429);
    });
  });

  describe("applyAll and skip limiter", function () {
    const ping_app = express();
    const config = {
    };

    applyAll(ping_app, config);
    ping_app.use("/ping", function (req, res) {
      res.send("ok");
    });

    it("should returns 200 if called 100 times", async function () {
      let response;
      for (let i = 0; i < 100; i++) {
        response = await request(ping_app).get("/ping");
        expect(response.status).eq(200);
      }
    });
  });

  describe("Rate limiting with helmet disabled", function () {
    const app = express();
    const config = {
      disableHelmet: true,
      rateLimiter: {
        windowMs: 10000, // 10 seconds
        max: 10, // Limit each IP to 10 requests per `window` (here, per 10 seconds)
      },
    };
    applyAll(app, config);
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
});

