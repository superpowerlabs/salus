const expect = require("chai").expect;
const request = require("supertest");
const app = require("./server/app");


describe("Security features for assets", function () {
  it("should not insert content security policies headers for assets", async function () {
    const response = await request(app).get("/images/bg.jpg");
    expect(response.headers['content-security-policy']).eq(undefined);
    expect(response.status).eq(200);
  });
});

