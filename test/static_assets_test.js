const expect = require("chai").expect;
const request = require("supertest");
const app = require("./server/app");

describe.only("Security features for assets", function () {
  it("should not insert content security policies headers for assets", async function () {
    const response = await request(app).get("/images/bg.jpg");
    console.log(response.headers)
    expect(response.headers['content-security-policy']).eq(undefined);
    expect(response.status).eq(200);
  });
});

