const request = require("supertest");
const expect = require("chai").expect;
const express = require('express');
const applySalus = require("../index.js");

describe("Rate limiting", function () {
  const ping_app = express();
  const config = {
    rateLimiter: {
      windowMs: 10000, // 10 seconds
      max: 10, // Limit each IP to 10 requests per `window` (here, per 10 seconds)
    },
  };
  applySalus(ping_app, config);
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

