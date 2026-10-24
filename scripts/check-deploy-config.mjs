import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
const databaseId = config.d1_databases?.[0]?.database_id;
const audience = config.vars?.ACCESS_AUD;
const teamDomain = config.vars?.ACCESS_TEAM_DOMAIN;
const errors = [];

if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(databaseId || "")
  || databaseId === "00000000-0000-4000-8000-000000000000") {
  errors.push("Set d1_databases[0].database_id to the ID of the new LHANA D1 database.");
}
if (!audience || audience.startsWith("REPLACE_")) {
  errors.push("Set vars.ACCESS_AUD to the audience tag from the LHANA Cloudflare Access application.");
}
if (!teamDomain || teamDomain.startsWith("REPLACE_")) {
  errors.push("Set vars.ACCESS_TEAM_DOMAIN to your Cloudflare Access team domain.");
}

if (errors.length) {
  console.error(`Deployment configuration is incomplete:\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("Cloudflare deployment configuration is ready.");
}
