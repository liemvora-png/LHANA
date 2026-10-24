let cachedKeys;
let cachedKeysAt = 0;
let cachedIssuer;

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}

async function getSigningKeys(issuer) {
  if (cachedKeys && cachedIssuer === issuer && Date.now() - cachedKeysAt < 300000) {
    return cachedKeys;
  }

  const response = await fetch(`${issuer}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error("Unable to load Cloudflare Access signing keys.");
  const body = await response.json();
  if (!Array.isArray(body.keys)) throw new Error("Cloudflare Access returned invalid signing keys.");

  cachedKeys = body.keys;
  cachedKeysAt = Date.now();
  cachedIssuer = issuer;
  return cachedKeys;
}

export async function authorizeAdmin(request, env) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD
    || env.ACCESS_TEAM_DOMAIN.startsWith("REPLACE_")
    || env.ACCESS_AUD.startsWith("REPLACE_")) {
    return {
      ok: false,
      status: 503,
      message: "Admin access is not configured. Complete the Cloudflare Access setup first."
    };
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return { ok: false, status: 401, message: "Cloudflare Access authentication is required." };
  if (token.length > 16384) return { ok: false, status: 401, message: "Cloudflare Access token is too large." };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, status: 401, message: "Invalid Cloudflare Access token." };

  try {
    const decode = (part) => JSON.parse(decodeBase64Url(part));
    const header = decode(parts[0]);
    const claims = decode(parts[1]);
    const issuer = `https://${env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
    const now = Math.floor(Date.now() / 1000);

    if (header.alg !== "RS256" || typeof header.kid !== "string"
      || claims.iss !== issuer
      || !(Array.isArray(claims.aud) ? claims.aud.includes(env.ACCESS_AUD) : claims.aud === env.ACCESS_AUD)
      || !Number.isFinite(claims.exp) || claims.exp <= now
      || (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > now))) {
      return { ok: false, status: 403, message: "Cloudflare Access token is invalid." };
    }

    const jwk = (await getSigningKeys(issuer)).find((key) => key.kid === header.kid);
    if (!jwk) return { ok: false, status: 401, message: "Unknown Cloudflare Access signing key." };

    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signature = Uint8Array.from(
      decodeBase64Url(parts[2]),
      (character) => character.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      signature,
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );

    return valid
      ? { ok: true }
      : { ok: false, status: 401, message: "Invalid Cloudflare Access token signature." };
  } catch (error) {
    console.error("Cloudflare Access verification failed:", error);
    return { ok: false, status: 401, message: "Unable to verify Cloudflare Access authentication." };
  }
}
