import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { exchangeCodeForTokens } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");

    if (error) {
      console.error("OAuth error:", error, req.nextUrl.searchParams.get("error_description"));
      return NextResponse.redirect(`${appUrl}/create?error=auth_failed`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${appUrl}/create?error=auth_failed`);
    }

    const session = await getSession();

    // CSRF check
    if (state !== session.oauth_state) {
      return NextResponse.redirect(`${appUrl}/create?error=auth_failed`);
    }

    if (!session.code_verifier) {
      return NextResponse.redirect(`${appUrl}/create?error=auth_failed`);
    }

    const redirectUri = `${appUrl}/api/auth/callback`;
    const tokens = await exchangeCodeForTokens(code, session.code_verifier, redirectUri);

    // Store tokens in session
    session.access_token = tokens.access_token;
    session.refresh_token = tokens.refresh_token;
    session.token_expires_at = Date.now() + tokens.expires_in * 1000;

    // Clear transient fields
    session.code_verifier = undefined;
    session.oauth_state = undefined;

    await session.save();

    return NextResponse.redirect(`${appUrl}/create`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${appUrl}/create?error=auth_failed`);
  }
}
