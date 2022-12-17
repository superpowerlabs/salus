const request = require("supertest");
const expect = require("chai").expect;
const app = require("./server/app");

describe("Content Security Policies", function () {
  it("should insert headers", async function () {
    const response = await request(app).get("/");
    //console.log(response.headers);
    const csp_headers = response.headers["content-security-policy"];

    expect(csp_headers).includes(
      "default-src 'self' example1.com example2.com"
    );
    expect(csp_headers).includes(
      "script-src 'self' example1.com self use-nonce"
    );
    expect(csp_headers).includes(
      "connect-src 'self' example1.com example3.com;"
    );
    expect(csp_headers).includes(
      "font-src 'self' example1.com fonts.gstatic.com"
    );
    expect(csp_headers).includes("img-src 'self' example1.com www.w3.org");
    expect(csp_headers).includes("style-src 'self' example1.com example4.com");
    expect(csp_headers).includes("upgrade-insecure-requests");
  });
});
