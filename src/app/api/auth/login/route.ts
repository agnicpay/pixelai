import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/session";
import { generatePKCE, buildAuthUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/callback`;

  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString("hex");

  const session = await getSession();
  session.code_verifier = codeVerifier;
  session.oauth_state = state;
  await session.save();

  const authUrl = buildAuthUrl(redirectUri, state, codeChallenge);
  return NextResponse.redirect(authUrl);
}
