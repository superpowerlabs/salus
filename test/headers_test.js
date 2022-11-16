const request = require("supertest");
const expect = require("chai").expect;
const app = require("./server/app");

describe("GET /", function () {
  it("responds with html (canary test)", function (done) {
    request(app).get("/").expect("Content-Type", /html/).expect(200, done);
  });

  it("html response body contains nonce in link and script tags", async function () {
    const response = await request(app).get("/");

    expect(response.text).match(/link nonce=/);
    expect(response.text).match(/script nonce=/);
  });

  it("headers includes rate limiting factors", function (done) {
    request(app).get("/").expect("X-RateLimit-Limit", "20").expect(200, done);
  });

  it("headers includes content security policies", function (done) {
    request(app)
      .get("/")
      .expect("Content-Security-Policy", /nonce/)
      .expect("Content-Security-Policy", /use-nonce/)
      .expect("Content-Security-Policy", /mob.land/)
      .expect("Content-Security-Policy", /upgrade-insecure-requests/)
      .expect(200, done);
  });

  it("headers includes X-Permitted-Cross-Domain-Policies", function (done) {
    request(app)
      .get("/")
      .expect("X-Permitted-Cross-Domain-Policies", /master-only/)
      .expect(200, done);
  });

  it("headers includes X-Frame-Options", function (done) {
    request(app).get("/").expect("X-Frame-Options", /DENY/).expect(200, done);
  });

  it("headers includes X-DNS-Prefetch-Control", function (done) {
    request(app)
      .get("/")
      .expect("X-DNS-Prefetch-Control", /on/)
      .expect(200, done);
  });

  it("headers includes Strict-Transport-Security", function (done) {
    request(app)
      .get("/")
      .expect("Strict-Transport-Security", /max-age=123456; preload/)
      .expect(200, done);
  });

  it("headers includes Referrer-Policy", function (done) {
    request(app)
      .get("/")
      .expect("Referrer-Policy", /origin,unsafe-url/)
      .expect(200, done);
  });

  it("headers includes Cross-Origin-Resource-Policy", function (done) {
    request(app)
      .get("/")
      .expect("Cross-Origin-Resource-Policy", /cross-origin/)
      .expect(200, done);
  });

  it("returns an error if rate limit reached", async function () {
    let response;
    for (let i = 0; i < 10; i++) {
      response = await request(app).get("/");
      expect(response.status).eq(200);
    }
    response = await request(app).get("/");
    expect(response.status).eq(429);
  });
});
