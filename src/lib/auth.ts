import crypto from "crypto";
import { getSession } from "./session";

const AGNIC_API_BASE = process.env.AGNIC_API_BASE || "https://api.agnic.ai";
const AGNIC_AUTH_URL = process.env.NEXT_PUBLIC_AGNIC_AUTH_URL || "https://app.agnic.ai";
const AGNIC_OAUTH_CLIENT_ID = process.env.AGNIC_OAUTH_CLIENT_ID || "pixelai";

export function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function buildAuthUrl(
  redirectUri: string,
  state: string,
  codeChallenge: string,
  options?: { display?: string; login_hint?: string },
) {
  const url = new URL("/oauth/authorize", AGNIC_API_BASE);
  url.searchParams.set("client_id", AGNIC_OAUTH_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "payments:sign balance:read");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (options?.display) url.searchParams.set("display", options.display);
  if (options?.login_hint) url.searchParams.set("login_hint", options.login_hint);
  return url.toString();
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string,
) {
  const res = await fetch(`${AGNIC_API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error_description || data.error || `Token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    expires_in: data.expires_in as number,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${AGNIC_API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error_description || data.error || `Token refresh failed: ${res.status}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    expires_in: data.expires_in as number,
  };
}

/**
 * Get a valid access token from the session.
 * Auto-refreshes if expired (with 5-min buffer).
 * Returns null if unauthenticated or refresh fails.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();

  if (!session.access_token) {
    return null;
  }

  // Check if token is still valid (with 5-minute buffer)
  const now = Date.now();
  const bufferMs = 5 * 60 * 1000;

  if (session.token_expires_at && now < session.token_expires_at - bufferMs) {
    return session.access_token;
  }

  // Token expired or about to expire -- try refresh
  if (!session.refresh_token) {
    session.destroy();
    return null;
  }

  try {
    const tokens = await refreshAccessToken(session.refresh_token);
    session.access_token = tokens.access_token;
    session.refresh_token = tokens.refresh_token;
    session.token_expires_at = Date.now() + tokens.expires_in * 1000;
    await session.save();
    return tokens.access_token;
  } catch {
    session.destroy();
    return null;
  }
}
