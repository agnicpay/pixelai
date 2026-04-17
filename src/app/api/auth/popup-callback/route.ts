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
      console.error(
        "OAuth popup error:",
        error,
        req.nextUrl.searchParams.get("error_description"),
      );
      return popupResponse(appUrl, false, error);
    }

    if (!code || !state) {
      return popupResponse(appUrl, false, "missing_params");
    }

    const session = await getSession();

    // CSRF check
    if (state !== session.oauth_state) {
      return popupResponse(appUrl, false, "state_mismatch");
    }

    if (!session.code_verifier) {
      return popupResponse(appUrl, false, "missing_verifier");
    }

    const redirectUri = `${appUrl}/api/auth/popup-callback`;
    const tokens = await exchangeCodeForTokens(
      code,
      session.code_verifier,
      redirectUri,
    );

    console.log("[popup-callback] token exchange ok", {
      has_access: !!tokens.access_token,
      has_refresh: !!tokens.refresh_token,
      expires_in: tokens.expires_in,
    });

    // Store tokens in session (httpOnly cookie — never exposed to client JS)
    session.access_token = tokens.access_token;
    session.refresh_token = tokens.refresh_token;
    session.token_expires_at = Date.now() + tokens.expires_in * 1000;

    // Clear transient fields
    session.code_verifier = undefined;
    session.oauth_state = undefined;

    await session.save();

    console.log("[popup-callback] session saved, returning success HTML", {
      appUrl,
    });
    return popupResponse(appUrl, true);
  } catch (error) {
    console.error("OAuth popup callback error:", error);
    return popupResponse(appUrl, false, "exchange_failed");
  }
}

/**
 * Return an HTML page that posts result to opener and closes the popup.
 * Tokens stay in the httpOnly cookie — only a success/error flag is posted.
 */
function popupResponse(
  appUrl: string,
  success: boolean,
  error?: string,
): NextResponse {
  const message = JSON.stringify({
    type: "agnic-oauth-result",
    success,
    ...(error ? { error } : {}),
  });

  const html = `<!DOCTYPE html>
<html>
<head><title>Authorization ${success ? "Complete" : "Failed"}</title></head>
<body>
<p>${success ? "Authorization complete. This window will close." : "Authorization failed. This window will close."}</p>
<script>
(function() {
  function closeSoon() {
    // Give the message a tick to dispatch before we close.
    setTimeout(function() { try { window.close(); } catch (e) {} }, 150);
  }
  try {
    if (window.opener && !window.opener.closed) {
      // Post to the opener's exact origin AND to "*" as a belt-and-braces fallback,
      // in case NEXT_PUBLIC_APP_URL doesn't exactly match the opener's origin.
      try { window.opener.postMessage(${message}, ${JSON.stringify(appUrl)}); } catch (e) {}
      try { window.opener.postMessage(${message}, "*"); } catch (e) {}
      closeSoon();
    } else {
      // No opener (popup blocked, opened as tab, or COOP severed). Navigate back —
      // the parent page will re-check /api/session on mount and pick up the session.
      window.location.href = ${JSON.stringify(appUrl + "/create")};
    }
  } catch(e) {
    window.location.href = ${JSON.stringify(appUrl + "/create")};
  }
})();
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
