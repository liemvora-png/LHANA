import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

test("does not serve the admin editor before Access is configured", async () => {
  let assetRequested = false;
  const response = await worker.fetch(
    new Request("https://lhana.liemvora.cc/admin"),
    { ASSETS: { fetch: () => { assetRequested = true; } } }
  );

  assert.equal(response.status, 503);
  assert.equal(assetRequested, false);
  assert.match((await response.json()).error, /Access setup/i);
});

test("protects admin APIs with Cloudflare Access", async () => {
  const response = await worker.fetch(
    new Request("https://lhana.liemvora.cc/api/admin/content"),
    {
      ACCESS_TEAM_DOMAIN: "old-shadow-43e8.cloudflareaccess.com",
      ACCESS_AUD: "lhana-test-audience"
    }
  );

  assert.equal(response.status, 401);
  assert.match((await response.json()).error, /authentication is required/i);
});

test("reports missing public content storage explicitly", async () => {
  const response = await worker.fetch(
    new Request("https://lhana.liemvora.cc/api/content"),
    {}
  );

  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /storage is not configured/i);
});
