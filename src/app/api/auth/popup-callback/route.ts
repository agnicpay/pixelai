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

    // Store tokens in session (httpOnly cookie — never exposed to client JS)
    session.access_token = tokens.access_token;
    session.refresh_token = tokens.refresh_token;
    session.token_expires_at = Date.now() + tokens.expires_in * 1000;

    // Clear transient fields
    session.code_verifier = undefined;
    session.oauth_state = undefined;

    await session.save();

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
  try {
    if (window.opener) {
      window.opener.postMessage(${message}, ${JSON.stringify(appUrl)});
      window.close();
    } else {
      // Fallback: no opener (popup blocked, or opened as tab)
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
