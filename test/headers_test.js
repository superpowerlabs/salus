const request = require("supertest");
const expect = require("chai").expect;
const app = require("./server/app");

describe("Security features", function () {
  it("should responds with html (canary test)", function (done) {
    request(app).get("/").expect("Content-Type", /html/).expect(200, done);
  });

  it("should insert nonce in link and script tags in html response body for /", async function () {
    const response = await request(app).get("/");
    expect(response.text).match(/link nonce=/);
    expect(response.text).match(/script nonce=/);
    expect(response.text).match(/property="csp-nonce" content=/);
  });

  it("should insert rate limiting factors headers", function (done) {
    request(app).get("/").expect("X-RateLimit-Limit", "12").expect(200, done);
  });

  it("should insert X-Permitted-Cross-Domain-Policies headers", function (done) {
    request(app)
      .get("/")
      .expect("X-Permitted-Cross-Domain-Policies", /master-only/)
      .expect(200, done);
  });

  it("should insert X-Frame-Options headers", function (done) {
    request(app).get("/").expect("X-Frame-Options", /DENY/).expect(200, done);
  });

  it("should insert X-DNS-Prefetch-Control headers", function (done) {
    request(app)
      .get("/")
      .expect("X-DNS-Prefetch-Control", /on/)
      .expect(200, done);
  });

  it("should insert Strict-Transport-Security headers", function (done) {
    request(app)
      .get("/")
      .expect("Strict-Transport-Security", /max-age=123456; preload/)
      .expect(200, done);
  });

  it("should insert Referrer-Policy headers", function (done) {
    request(app)
      .get("/")
      .expect("Referrer-Policy", /origin,unsafe-url/)
      .expect(200, done);
  });

  it("should insert Cross-Origin-Resource-Policy headers", function (done) {
    request(app)
      .get("/")
      .expect("Cross-Origin-Resource-Policy", /cross-origin/)
      .expect(200, done);
  });
});
